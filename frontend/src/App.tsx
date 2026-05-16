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

const BACKEND_ORIGIN = 'https://audit-swap.vercel.app';
const API_STATUS_URL = `${BACKEND_ORIGIN}/api/status`;
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
    message: 'Deployed backend unavailable. Displaying mock token registry.',
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
  detected: 'text-zinc-300 bg-white/[0.06] border-white/[0.08]',
  auditing: 'text-amber-200 bg-amber-300/10 border-amber-300/15',
  rejected: 'text-rose-200 bg-rose-300/10 border-rose-300/15',
  swapping: 'text-sky-200 bg-sky-300/10 border-sky-300/15',
  swapped: 'text-emerald-200 bg-emerald-300/10 border-emerald-300/15',
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

  return (
    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/[0.1] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),rgba(255,255,255,0.08)_42%,rgba(255,255,255,0.03)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_rgba(0,0,0,0.35)]">
      {token.logoURI && !imageFailed ? (
        <img
          src={token.logoURI}
          alt={`${token.name} logo`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-zinc-100">
          {initials}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/[0.08]" />
    </div>
  );
}

function AppLogo() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.045]">
      {!imageFailed ? (
        <img
          src="/logo.png"
          alt="AuditSwap logo"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="font-mono text-sm font-semibold text-zinc-100">AS</span>
      )}
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState('INITIALIZING');
  const [logs, setLogs] = useState<SettlementLog[]>([]);
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [tokensScanned, setTokensScanned] = useState(0);
  const [lastSync, setLastSync] = useState('Awaiting status');
  const [connectionMode, setConnectionMode] = useState<'live' | 'mock'>('live');
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
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
    const terminal = terminalScrollRef.current;

    if (terminal) {
      terminal.scrollTo({
        top: terminal.scrollHeight,
        behavior: logs.length > 1 ? 'smooth' : 'auto',
      });
    } else {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
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
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-white">AuditSwap</h1>
              <div className="mt-0.5 text-xs text-zinc-500">Powered by Birdeye</div>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 font-mono text-xs text-zinc-300">
            <div className="hidden items-center gap-2 rounded-full bg-white/[0.045] px-3 py-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              <span>Solana Devnet</span>
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

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(460px,0.95fr)] lg:px-8 lg:pb-8">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080809]/92 shadow-[0_24px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex shrink-0 items-start justify-between gap-6 px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Token Registry</h2>
              </div>
              <div className="hidden shrink-0 rounded-2xl border border-white/[0.07] bg-black/30 px-5 py-3 text-right sm:block">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Assets</div>
                <div className="mt-1 font-mono text-3xl text-zinc-100">{tokens.length}</div>
              </div>
            </div>

            <div className="mx-5 h-px bg-white/[0.06] sm:mx-6" />

            <div className="grid shrink-0 grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4 sm:px-6">
              <div className="rounded-xl border border-white/[0.055] bg-black/25 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Queries</div>
                <div className="mt-1 font-mono text-xl text-zinc-100">{tokensScanned.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/[0.055] bg-black/25 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Success</div>
                <div className="mt-1 font-mono text-xl text-emerald-300">{logCounts.SUCCESS}</div>
              </div>
              <div className="rounded-xl border border-white/[0.055] bg-black/25 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Warnings</div>
                <div className="mt-1 font-mono text-xl text-amber-300">{logCounts.WARN}</div>
              </div>
              <div className="rounded-xl border border-white/[0.055] bg-black/25 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Slippage</div>
                <div className="mt-1 font-mono text-xl text-zinc-100">2.0%</div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
              {tokens.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto h-2 w-2 rounded-full bg-zinc-600" />
                    <p className="mt-4 text-sm text-zinc-300">Waiting for token metadata.</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      AuditSwap will populate this registry after the next backend scan.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {tokens.map((token) => (
                    <div
                      key={token.address}
                      className="grid min-h-[96px] grid-cols-[56px_minmax(0,1fr)] gap-4 rounded-2xl border border-white/[0.06] bg-black/30 p-4 transition-colors hover:border-white/[0.13] hover:bg-white/[0.035] sm:grid-cols-[64px_minmax(0,1fr)_auto]"
                    >
                      <div className="h-14 w-14 sm:h-16 sm:w-16">
                        <TokenLogo token={token} />
                      </div>

                      <div className="min-w-0 self-center">
                        <div className="flex min-w-0 items-baseline gap-2">
                          <div className="truncate text-lg font-semibold text-zinc-100">{token.name}</div>
                          <div className="shrink-0 font-mono text-xs text-zinc-500">{token.symbol}</div>
                        </div>
                        <div className="mt-2 font-mono text-xs text-zinc-600">
                          <span className="sm:hidden">{truncateAddress(token.address)}</span>
                          <span className="hidden truncate sm:block">{token.address}</span>
                        </div>
                      </div>

                      <div className={`col-span-2 w-fit self-center rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase sm:col-span-1 ${tokenStatusStyle[token.status]}`}>
                        {token.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4">
            <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0b0d]/94 shadow-[0_24px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
                  <div className="text-[11px] text-zinc-500">Data Source</div>
                  <div className="mt-1 truncate text-sm text-zinc-100">
                    {connectionMode === 'live' ? 'Birdeye Enterprise API' : 'Mock Registry Fallback'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
                  <div className="text-[11px] text-zinc-500">Last Sync</div>
                  <div className="mt-1 truncate font-mono text-sm text-zinc-100">{lastSync}</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
                  <div className="text-[11px] text-zinc-500">Mapped</div>
                  <div className="mt-1 font-mono text-2xl text-zinc-100">{tokens.length.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
                  <div className="text-[11px] text-zinc-500">Queries</div>
                  <div className="mt-1 font-mono text-2xl text-zinc-100">{tokensScanned.toLocaleString()}</div>
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080809]/94 shadow-[0_24px_80px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex shrink-0 items-center justify-between px-5 py-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Execution Terminal</div>
                  <h2 className="mt-1 text-lg font-semibold text-white">Live telemetry</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 font-mono text-[11px] text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  1000ms
                </div>
              </div>

              <div className="mx-5 h-px bg-white/[0.06]" />

              <div ref={terminalScrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 font-mono text-[11px]">
                {logs.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-white/[0.06] bg-black/25 p-4 text-center text-sm leading-6 text-zinc-500">
                    Waiting for settlement logs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div
                        key={`${log.timestamp}-${index}-${log.type}-${log.message}`}
                        className="rounded-xl border border-white/[0.045] bg-black/30 p-3 transition-colors hover:border-white/[0.09] hover:bg-white/[0.03]"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="tabular-nums text-zinc-600">{formatLogTime(log.timestamp)}</span>
                          <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${typeStyle[log.type]}`}>
                            {log.type}
                          </span>
                        </div>
                        <div className={`break-words leading-5 ${messageStyle[log.type]}`}>{log.message}</div>
                      </div>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>
                )}
              </div>
            </section>

          </aside>
        </main>
      </div>
    </div>
  );
}
