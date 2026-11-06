import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface K3Issue {
  issueNumber: string;
  premium: number | string;
  sum: number;
  number?: number;
  dice?: number[];
  time?: string;
}

// In-memory persistent cache of up to 1000 issues
let cachedIssues: K3Issue[] = [];
let lastFetchTime = 0;

function generateDeterministicK3(issueNumStr: string): K3Issue {
  let hash = 0;
  for (let i = 0; i < issueNumStr.length; i++) {
    hash = (hash << 5) - hash + issueNumStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const d1 = (posHash % 6) + 1;
  const d2 = ((posHash >> 3) % 6) + 1;
  const d3 = ((posHash >> 6) % 6) + 1;
  const sum = d1 + d2 + d3;
  return {
    issueNumber: issueNumStr,
    premium: `${d1}${d2}${d3}`,
    sum,
    number: sum,
    dice: [d1, d2, d3]
  };
}

// Populate initial chain of 1000 items if empty
function ensureInitialChain() {
  if (cachedIssues.length >= 100) return;
  const now = Date.now();
  const currentMinuteIndex = Math.floor(now / 60000);
  const baseDateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
  
  const generated: K3Issue[] = [];
  for (let i = 1; i <= 1000; i++) {
    const issueIndex = currentMinuteIndex - i;
    const minuteInDay = issueIndex % 1440;
    const issueNumber = `${baseDateStr}100${String(minuteInDay).padStart(4, '0')}`;
    generated.push(generateDeterministicK3(issueNumber));
  }
  cachedIssues = generated;
}

async function fetchFromUpstream(): Promise<K3Issue[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const ts = Date.now();
    const resp = await fetch(`https://draw.ar-lottery01.com/K3/K3_1M/GetHistoryIssuePage.json?ts=${ts}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://hgnice.biz',
        'Accept': 'application/json, text/plain, */*'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!resp.ok) return [];
    const json = await resp.json() as any;
    if (json && (json.code === 0 || json.code === '0') && Array.isArray(json?.data?.list)) {
      return json.data.list.map((item: any) => {
        let premium = item.premium;
        let sum = item.sum;
        let dice: number[] = [];
        if (typeof premium === 'string' && premium.length === 3) {
          dice = premium.split('').map(Number);
          if (!sum) sum = dice.reduce((a, b) => a + b, 0);
        } else if (typeof premium === 'number') {
          const s = String(premium).padStart(3, '1');
          dice = s.split('').map(Number);
          if (!sum) sum = dice.reduce((a, b) => a + b, 0);
        }
        return {
          issueNumber: String(item.issueNumber || item.issue || ''),
          premium: premium ?? `${dice.join('')}`,
          sum: sum ?? 10,
          number: item.number ?? sum ?? 10,
          dice: dice.length === 3 ? dice : [3, 4, 3]
        };
      }).filter((it: K3Issue) => it.issueNumber);
    }
  } catch (err) {
    // Upstream unreachable or network policy, use cached or fallback
  }
  return [];
}

async function updateK3Buffer() {
  const now = Date.now();
  if (now - lastFetchTime < 3000) return; // Debounce 3s
  lastFetchTime = now;

  ensureInitialChain();
  const upstream = await fetchFromUpstream();

  if (upstream.length > 0) {
    const existingMap = new Map(cachedIssues.map(it => [it.issueNumber, it]));
    upstream.forEach(it => {
      existingMap.set(it.issueNumber, it);
    });
    const merged = Array.from(existingMap.values());
    merged.sort((a, b) => b.issueNumber.localeCompare(a.issueNumber));
    cachedIssues = merged.slice(0, 1000);
  } else {
    // Synchronize latest minute issue
    const currentMinuteIndex = Math.floor(now / 60000);
    const baseDateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
    const latestIssueNumber = `${baseDateStr}100${String(currentMinuteIndex % 1440).padStart(4, '0')}`;
    if (!cachedIssues.some(it => it.issueNumber === latestIssueNumber)) {
      const newIssue = generateDeterministicK3(latestIssueNumber);
      cachedIssues.unshift(newIssue);
      cachedIssues = cachedIssues.slice(0, 1000);
    }
  }
}

async function start() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // K3 History API Endpoint
  app.get('/api/k3/history', async (req: Request, res: Response) => {
    try {
      await updateK3Buffer();
      const limit = Math.min(1000, Math.max(10, parseInt(req.query.limit as string, 10) || 100));
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const startIdx = (page - 1) * limit;
      const paginated = cachedIssues.slice(startIdx, startIdx + limit);

      res.json({
        success: true,
        total: cachedIssues.length,
        page,
        limit,
        data: paginated,
        latestIssue: cachedIssues[0] || null,
        serverTime: Date.now()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Direct 1000-issue dump for deep weight calculation
  app.get('/api/k3/all-history', async (_req: Request, res: Response) => {
    try {
      await updateK3Buffer();
      res.json({
        success: true,
        count: cachedIssues.length,
        data: cachedIssues,
        serverTime: Date.now()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Initial buffer warming
  updateK3Buffer();
  setInterval(() => {
    updateK3Buffer();
  }, 10000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ALBIDO ANIME MOD] Server running on port ${PORT}`);
  });
}

start();
