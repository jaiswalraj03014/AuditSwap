import type { FC } from 'react';
import type { SessionMetrics, SwapRecord } from '../../types';
import { truncateAddress, truncateTxHash } from '../../data/mockData';

interface Props {
  metrics: SessionMetrics;
  swapHistory: SwapRecord[];
}

// ── Metric card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

const MetricCard: FC<MetricCardProps> = ({ label, value, sub, highlight }) => (
  <div className="bg-[#f4f3ef] dark:bg-[#050505] border border-neutral-200 dark:border-neutral-800 rounded p-3">
    <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">{label}</div>
    <div
      className={`text-xl font-light tabular-nums leading-none ${
        highlight ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
      }`}
    >
      {value}
    </div>
    {sub && <div className="text-[9px] text-neutral-500 mt-1">{sub}</div>}
  </div>
);

// ── Param row ────────────────────────────────────────────────────────────────

const ParamRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-neutral-200/60 dark:border-neutral-800/60 last:border-0">
    <span className="text-[10px] text-neutral-500">{label}</span>
    <span className="text-[10px] text-neutral-700 dark:text-neutral-400 font-mono font-semibold">{value}</span>
  </div>
);

// ── Swap history row ────────────────────────────────────────────────────────

const SwapRow: FC<{ swap: SwapRecord }> = ({ swap }) => (
  <div className="py-2.5 border-b border-neutral-200/40 dark:border-neutral-800/40 last:border-0 swap-row">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center space-x-2">
        <span className="text-neutral-900 dark:text-white text-[10px] font-bold tracking-wide">{swap.symbol}</span>
        <span className="text-neutral-500 text-[9px]">{swap.amount} SOL</span>
      </div>
      <div className="flex items-center space-x-1.5">
        <span className="text-neutral-900 dark:text-white text-[10px]">✓</span>
        <span className="text-[9px] text-neutral-500 tabular-nums">{swap.timestamp}</span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-neutral-500 font-mono">
        {truncateAddress(swap.address)}
      </span>
      <div className="flex items-center space-x-2">
        <span className="text-[9px] text-neutral-600 dark:text-neutral-500">${swap.valueUsd.toFixed(2)}</span>
        <span className="text-[9px] text-neutral-400 dark:text-neutral-600 font-mono">
          {truncateTxHash(swap.txHash)}
        </span>
      </div>
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────────────────

const MetricsPanel: FC<Props> = ({ metrics, swapHistory }) => {
  const passRate =
    metrics.tokensDetected > 0
      ? ((metrics.passed / metrics.tokensDetected) * 100).toFixed(1)
      : '0.0';

  const totalValueUsd = swapHistory
    .reduce((acc, s) => acc + s.valueUsd, 0)
    .toFixed(2);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Session metrics */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-3">
          Session Metrics
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="Detected" value={metrics.tokensDetected} sub="new listings" />
          <MetricCard label="Swapped" value={metrics.swapsExecuted} sub="executed" highlight />
          <MetricCard label="Rejected" value={metrics.rejected} sub="discarded" />
          <MetricCard label="Pass Rate" value={`${passRate}%`} sub="audit success" />
        </div>
      </div>

      {/* Audit parameters */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">
          Audit Parameters
        </div>
        <div>
          <ParamRow label="Min Liquidity" value="> $50,000" />
          <ParamRow label="Max Holder Conc." value="≤ 30%" />
          <ParamRow label="Honeypot Threshold" value="< 0.05" />
          <ParamRow label="Swap Amount" value="0.50 SOL" />
          <ParamRow label="Slippage Guard" value="2.0%" />
        </div>
      </div>

      {/* Swap history */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 py-3">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
            Swap History
          </span>
          <span className="text-[9px] text-neutral-500">${totalValueUsd} total</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {swapHistory.length === 0 ? (
            <div className="text-[10px] text-neutral-500 py-4 text-center tracking-wide">
              // No swaps yet this session
            </div>
          ) : (
            swapHistory.map(swap => <SwapRow key={swap.id} swap={swap} />)
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <p className="text-[9px] text-neutral-500">
          Mock data · Live API integration pending
        </p>
      </div>
    </div>
  );
};

export default MetricsPanel;
