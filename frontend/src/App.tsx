import { useEffect, useMemo, useRef, useState } from 'react';

type LogType = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

type SettlementLog = {
  timestamp: string;
  type: LogType;
  message: string;
};

type TokenStatus = 'detected' | 'auditing' | 'rejected' | 'swapping' | 'swapped';

type TokenEntry = {
  address: string;
  symbol: string;
  name: string;
  logoURI: string | null;
  status: TokenStatus;
  discoveredAt: string;
};

type StatusResponse = {
  status: string;
  logs: SettlementLog[];
  tokens?: TokenEntry[];
};

const API_STATUS_URL = 'http://localhost:3000/api/status';
const MOCK_BASE_TIME = Date.now();

const mockTokens: TokenEntry[] = [
  {
    address: 'DezXAZ8z7PnrnRJjz3UCC9cZbq4xqfZVa6xYFe4PteJ',
    symbol: 'BONK',
    name: 'Bonk',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3UCC9cZbq4xqfZVa6xYFe4PteJ/logo.png',
    status: 'swapped',
    discoveredAt: new Date(MOCK_BASE_TIME - 42_000).toISOString(),
  },
  {
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    logoURI: 'https://static.jup.ag/jup/icon.png',
    status: 'auditing',
    discoveredAt: new Date(MOCK_BASE_TIME - 31_000).toISOString(),
  },
  {
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzL262M9uPcJ2',
    symbol: 'WIF',
    name: 'dogwifhat',
    logoURI: 'https://bafkreihwiflra4jwpdes4wztg4sddvjesmd54w4c2rh7uzw5z5ytmtr7wu.ipfs.nftstorage.link',
    status: 'detected',
    discoveredAt: new Date(MOCK_BASE_TIME - 18_000).toISOString(),
  },
  {
    address: 'MEW1gQWJ3nEXg2qgERiWHbHfBbdMZKqHFeqBuM5KqqQ',
    symbol: 'MEW',
    name: 'cat in a dogs world',
    logoURI: null,
    status: 'swapping',
    discoveredAt: new Date(MOCK_BASE_TIME - 11_000).toISOString(),
  },
  {
    address: '7vfCXTUXx5WJV74QYdJZxqBvQF9Xukb8Ua7TcVqgLiq',
    symbol: 'ETH',
    name: 'Wrapped Ethereum',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV74QYdJZxqBvQF9Xukb8Ua7TcVqgLiq/logo.png',
    status: 'rejected',
    discoveredAt: new Date(MOCK_BASE_TIME - 7_000).toISOString(),
  },
];

const mockLogs: SettlementLog[] = [
  {
    timestamp: new Date(MOCK_BASE_TIME - 45_000).toISOString(),
    type: 'INFO',
    message: 'Querying /v2/tokens/new_listing for latest deployments',
  },
  {
    timestamp: new Date(MOCK_BASE_TIME - 39_000).toISOString(),
    type: 'SUCCESS',
    message: 'Mapped token metadata for BONK, JUP, WIF, MEW, and ETH.',
  },
  {
    timestamp: new Date(MOCK_BASE_TIME - 28_000).toISOString(),
    type: 'INFO',
    message: 'Running localized mock settlement stream while backend is offline.',
  },
  {
    timestamp: new Date(MOCK_BASE_TIME - 14_000).toISOString(),
    type: 'WARN',
    message: 'Backend unavailable at localhost:3000. Displaying mock token registry.',
  },
];

const typeStyle: Record<LogType, string> = {
  INFO: 'text-zinc-400 bg-white/[0.035]',
  SUCCESS: 'text-emerald-300 bg-emerald-300/10',
  WARN: 'text-amber-300 bg-amber-300/10',
  ERROR: 'text-rose-300 bg-rose-300/10',
};

const messageStyle: Record<LogType, string> = {
  INFO: 'text-zinc-300',
  SUCCESS: 'text-emerald-100',
  WARN: 'text-amber-100',
  ERROR: 'text-rose-100',
};

const tokenStatusStyle: Record<TokenStatus, string> = {
  detected: 'text-zinc-300 bg-white/[0.045]',
  auditing: 'text-amber-200 bg-amber-300/10',
  rejected: 'text-rose-200 bg-rose-300/10',
  swapping: 'text-sky-200 bg-sky-300/10',
  swapped: 'text-emerald-200 bg-emerald-300/10',
};

function formatLogTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function truncateAddress(address: string) {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

function TokenLogo({ token }: { token: TokenEntry }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = token.symbol.slice(0, 2).toUpperCase();

  if (token.logoURI && !imageFailed) {
    return (
      <img
        src={token.logoURI}
        alt={`${token.name} logo`}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.32),rgba(255,255,255,0.08)_42%,rgba(255,255,255,0.03)_100%)] text-[11px] font-semibold text-zinc-200">
      {initials}
    </span>
  );
}

export default function App() {
  const [status, setStatus] = useState('INITIALIZING');
  const [logs, setLogs] = useState<SettlementLog[]>([]);
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [tokensScanned, setTokensScanned] = useState(0);
  const [lastSync, setLastSync] = useState('Awaiting status');
  const [connectionMode, setConnectionMode] = useState<'live' | 'mock'>('live');
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);
  const countedQueryLogsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const syncStatus = async () => {
      try {
        const response = await fetch(API_STATUS_URL, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`Status endpoint returned ${response.status}`);
        }

        const data = (await response.json()) as StatusResponse;
        const nextLogs = Array.isArray(data.logs) ? data.logs : [];

        if (!mounted) {
          return;
        }

        setStatus(data.status || 'ONLINE');
        setLogs(nextLogs);
        setTokens(Array.isArray(data.tokens) ? data.tokens : []);
        setConnectionMode('live');
        setLastSync(new Date().toLocaleTimeString());

        let newQueryCount = 0;
        for (const log of nextLogs) {
          const logKey = `${log.timestamp}:${log.type}:${log.message}`;

          if (log.message.includes('Querying') && !countedQueryLogsRef.current.has(logKey)) {
            countedQueryLogsRef.current.add(logKey);
            newQueryCount += 1;
          }
        }

        if (newQueryCount > 0) {
          setTokensScanned((current) => current + newQueryCount);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        setStatus('DISCONNECTED');
        setConnectionMode('mock');
        setTokens(mockTokens);
        setLastSync('Mock fallback');
        setLogs([
          ...mockLogs,
          {
            timestamp: new Date(MOCK_BASE_TIME - 4_000).toISOString(),
            type: 'ERROR',
            message: error instanceof Error ? error.message : 'Unable to reach settlement core',
          },
        ]);
        setTokensScanned((current) => (current === 0 ? mockTokens.length : current));
      }
    };

    void syncStatus();
    const intervalId = window.setInterval(syncStatus, 1000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs.length]);

  const statusDot = useMemo(() => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('error') || normalizedStatus.includes('disconnect')) {
      return 'bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.35)]';
    }

    if (normalizedStatus.includes('warn') || normalizedStatus.includes('pending')) {
      return 'bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.3)]';
    }

    return 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.32)]';
  }, [status]);

  const logCounts = useMemo(
    () =>
      logs.reduce(
        (counts, log) => {
          counts[log.type] += 1;
          return counts;
        },
        { INFO: 0, SUCCESS: 0, WARN: 0, ERROR: 0 } as Record<LogType, number>,
      ),
    [logs],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505] text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950">
      <div className="film-grain" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,#0a0a0c_0%,#050505_52%,#030303_100%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between px-5 sm:px-8">
          <div className="min-w-0">
            <div className="text-xs text-zinc-500">Autonomous DeFAI Settlement</div>
            <h1 className="mt-1 truncate text-2xl font-semibold text-white">AuditSwap // Core</h1>
          </div>

          <div className="flex min-w-0 items-center gap-3 font-mono text-xs text-zinc-300">
            <div className="hidden items-center gap-2 rounded-full bg-white/[0.045] px-3 py-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              <span>Solana Mainnet</span>
            </div>
            <div className="hidden rounded-full bg-white/[0.045] px-3 py-2 text-zinc-400 sm:block">
              {connectionMode === 'live' ? 'Live API' : 'Mock Mode'}
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-full bg-white/[0.065] px-3 py-2">
              <span className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${statusDot}`} />
              <span className="truncate">{status}</span>
            </div>
          </div>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:pb-8">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-sm bg-[#09090a]/90 shadow-[0_24px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="grid shrink-0 grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4 sm:px-5">
              <div>
                <div className="text-xs text-zinc-500">Tokens</div>
                <div className="mt-1 font-mono text-xl text-zinc-100">{tokens.length}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Success</div>
                <div className="mt-1 font-mono text-xl text-emerald-300">{logCounts.SUCCESS}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Warnings</div>
                <div className="mt-1 font-mono text-xl text-amber-300">{logCounts.WARN}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Last Sync</div>
                <div className="mt-1 truncate font-mono text-sm text-zinc-300">{lastSync}</div>
              </div>
            </div>

            <div className="mx-4 h-px bg-white/[0.06] sm:mx-5" />

            <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">Execution Terminal</h2>
                <p className="mt-1 text-xs text-zinc-500">Live settlement telemetry from the AuditSwap core.</p>
              </div>
              <div className="hidden font-mono text-xs text-zinc-500 sm:block">polling 1000ms</div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 font-mono text-xs sm:px-5">
              {logs.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto h-2 w-2 rounded-full bg-zinc-600" />
                    <p className="mt-4 text-sm text-zinc-300">Waiting for settlement logs.</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      Start the backend status endpoint and AuditSwap will stream activity here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={`${log.timestamp}-${index}-${log.type}-${log.message}`}
                      className="grid grid-cols-[74px_68px_minmax(0,1fr)] items-start gap-3 rounded-sm px-2 py-2 hover:bg-white/[0.035]"
                    >
                      <span className="pt-0.5 tabular-nums text-zinc-600">{formatLogTime(log.timestamp)}</span>
                      <span
                        className={`inline-flex h-5 items-center justify-center rounded-sm px-2 text-[10px] font-semibold ${typeStyle[log.type]}`}
                      >
                        {log.type}
                      </span>
                      <span className={`break-words leading-5 ${messageStyle[log.type]}`}>{log.message}</span>
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>
              )}
            </div>
          </section>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-sm bg-[#0d0d0f]/92 shadow-[0_24px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="px-5 py-5">
              <div className="text-xs text-zinc-500">Session Metrics</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Settlement session</h2>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="space-y-6 px-5 py-6">
              <div>
                <div className="text-xs text-zinc-500">Data Source</div>
                <div className="mt-2 text-base text-zinc-100">
                  {connectionMode === 'live' ? 'Birdeye Enterprise API' : 'Mock Registry Fallback'}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-500">Query Events</div>
                <div className="mt-2 font-mono text-5xl font-semibold tabular-nums text-white">
                  {tokensScanned.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-500">Tokens Mapped</div>
                <div className="mt-2 font-mono text-2xl text-zinc-100">{tokens.length.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-xs text-zinc-500">Slippage Guard</div>
                <div className="mt-2 font-mono text-2xl text-zinc-100">2.0%</div>
              </div>
            </div>

            <div className="mx-5 h-px bg-white/[0.06]" />

            <div className="min-h-0 flex-1 px-5 py-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500">Token Registry</div>
                <div className="font-mono text-[11px] text-zinc-600">{tokens.length} assets</div>
              </div>

              <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1 lg:max-h-none">
                {tokens.length === 0 ? (
                  <div className="rounded-sm bg-black/25 p-4 text-sm leading-6 text-zinc-500">
                    No token metadata received yet. The backend will populate this list after the next Birdeye scan.
                  </div>
                ) : (
                  tokens.map((token) => (
                    <div key={token.address} className="flex items-center gap-3 rounded-sm bg-black/25 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] text-xs font-semibold text-zinc-400">
                        <TokenLogo token={token} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="truncate text-sm font-medium text-zinc-100">{token.name}</div>
                          <div className="shrink-0 font-mono text-[11px] text-zinc-500">{token.symbol}</div>
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-zinc-600">{truncateAddress(token.address)}</div>
                      </div>

                      <div
                        className={`shrink-0 rounded-sm px-2 py-1 font-mono text-[10px] uppercase ${tokenStatusStyle[token.status]}`}
                      >
                        {token.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mx-5 h-px bg-white/[0.06]" />

            <div className="px-5 py-5">
              <div className="text-xs text-zinc-500">Risk Protocol</div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                The Markovian Execution Protocol evaluates every route as a state transition, balancing live
                liquidity, recent slippage, and settlement pressure before autonomous execution.
              </p>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-sm bg-black/35 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Core URL</span>
                  <span className="font-mono text-zinc-300">localhost:3000</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Errors</span>
                  <span className="font-mono text-rose-300">{logCounts.ERROR}</span>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
