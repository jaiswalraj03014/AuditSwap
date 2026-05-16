import type { FC } from 'react';
import type { TokenEntry, TokenStatus } from '../../types';
import { truncateAddress } from '../../data/mockData';

interface Props {
  feed: TokenEntry[];
}

interface StatusConfig {
  dot: string;
  label: string;
  labelClass: string;
  rowClass: string;
}

const STATUS_MAP: Record<TokenStatus, StatusConfig> = {
  detected: {
    dot: 'bg-neutral-400 dark:bg-neutral-600',
    label: 'DETECTED',
    labelClass: 'text-neutral-500 dark:text-neutral-600',
    rowClass: '',
  },
  auditing: {
    dot: 'bg-amber-500 animate-pulse',
    label: 'AUDITING',
    labelClass: 'text-amber-600 dark:text-amber-500/90',
    rowClass: 'bg-amber-500/[0.06] dark:bg-amber-500/[0.03] border-l border-amber-500/30 dark:border-amber-500/20',
  },
  rejected: {
    dot: 'bg-red-500/80',
    label: 'REJECTED',
    labelClass: 'text-red-500/90 dark:text-red-500/70',
    rowClass: '',
  },
  swapping: {
    dot: 'bg-neutral-900 dark:bg-white animate-pulse',
    label: 'SWAPPING',
    labelClass: 'text-neutral-800/80 dark:text-white/80',
    rowClass: 'bg-neutral-900/[0.04] dark:bg-white/[0.02]',
  },
  swapped: {
    dot: 'bg-neutral-900 dark:bg-white',
    label: 'SWAPPED',
    labelClass: 'text-neutral-900 dark:text-white',
    rowClass: 'bg-neutral-900/[0.05] dark:bg-white/[0.03]',
  },
};

const TokenRow: FC<{ token: TokenEntry }> = ({ token }) => {
  const cfg = STATUS_MAP[token.status];

  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2 rounded group token-row ${cfg.rowClass}`}
    >
      <div className="flex items-center space-x-2 min-w-0">
        <span className="text-[9px] text-neutral-500 w-[52px] flex-shrink-0 tabular-nums">
          {token.discoveredAt}
        </span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-mono w-[76px] flex-shrink-0 hidden sm:block">
          {truncateAddress(token.address)}
        </span>
        <span className="text-[11px] text-neutral-800 dark:text-neutral-300 font-semibold tracking-wide truncate">
          {token.symbol}
        </span>
      </div>

      <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
        <div className={`w-1 h-1 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-[9px] uppercase tracking-widest font-semibold ${cfg.labelClass}`}>
          {token.status === 'rejected' && token.rejectGate
            ? `G${token.rejectGate}`
            : cfg.label}
        </span>
      </div>
    </div>
  );
};

const LiveFeed: FC<Props> = ({ feed }) => {
  const passedCount = feed.filter(t => t.status === 'swapped').length;
  const rejectedCount = feed.filter(t => t.status === 'rejected').length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 rounded-full bg-neutral-500 animate-pulse" />
            <span className="text-[10px] text-neutral-600 dark:text-neutral-500 uppercase tracking-widest font-semibold">
              Live Token Stream
            </span>
          </div>
          <span className="text-[9px] text-neutral-500 tabular-nums">{feed.length} seen</span>
        </div>
        <p className="text-[9px] text-neutral-500 tracking-wide">
          Birdeye /v2/tokens/new_listing
        </p>
      </div>

      {/* Mini stats */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="flex-1 px-4 py-2 border-r border-neutral-200 dark:border-neutral-800">
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest">Passed</div>
          <div className="text-sm text-neutral-900 dark:text-white font-light tabular-nums">{passedCount}</div>
        </div>
        <div className="flex-1 px-4 py-2">
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest">Rejected</div>
          <div className="text-sm text-red-500 dark:text-red-500/70 font-light tabular-nums">{rejectedCount}</div>
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {feed.length === 0 ? (
          <div className="px-2 py-4 text-[10px] text-neutral-500 dark:text-neutral-600 tracking-wider">
            // Awaiting Birdeye stream...
          </div>
        ) : (
          feed.map(token => <TokenRow key={token.id} token={token} />)
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <p className="text-[9px] text-neutral-500 tracking-wide">
          Chain: Solana Mainnet · Polling: 1s
        </p>
      </div>
    </div>
  );
};

export default LiveFeed;
