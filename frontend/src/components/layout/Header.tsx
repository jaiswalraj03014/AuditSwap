import type { FC } from 'react';
import type { EngineStatus } from '../../types';
import { formatUptime } from '../../data/mockData';

interface Props {
  status: EngineStatus;
  uptime: number;
  queueLength: number;
}

const STATUS_CONFIG: Record<EngineStatus, { dot: string; text: string; label: string }> = {
  SCANNING: {
    dot: 'bg-neutral-400 animate-pulse',
    text: 'text-neutral-400',
    label: 'SCANNING',
  },
  AUDITING: {
    dot: 'bg-amber-500 animate-pulse',
    text: 'text-amber-500/90',
    label: 'AUDITING',
  },
  EXECUTING: {
    dot: 'bg-white animate-pulse',
    text: 'text-white',
    label: 'EXECUTING',
  },
  IDLE: {
    dot: 'bg-neutral-700',
    text: 'text-neutral-600',
    label: 'IDLE',
  },
};

const Header: FC<Props> = ({ status, uptime, queueLength }) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-[#050505] flex-shrink-0 z-10">
      {/* Brand */}
      <div className="flex items-center space-x-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold tracking-[0.2em] text-sm uppercase">
              AuditSwap
            </span>
            <span className="text-neutral-700 text-sm font-light">//</span>
            <span className="text-neutral-500 text-[11px] tracking-widest uppercase font-medium">
              Nexus Engine
            </span>
          </div>
          <p className="text-[9px] text-neutral-700 tracking-widest mt-0.5">
            Autonomous Risk-Gated Settlement · Solana Mainnet
          </p>
        </div>

        <div className="h-8 w-px bg-neutral-800" />

        {/* Engine status */}
        <div className="flex items-center space-x-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>

        {queueLength > 0 && (
          <div className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            <span className="text-[9px] text-neutral-600 uppercase tracking-widest">Queue</span>
            <span className="text-[10px] text-neutral-400 font-semibold">{queueLength}</span>
          </div>
        )}
      </div>

      {/* Right meta */}
      <div className="flex items-center space-x-5">
        <div className="text-right">
          <div className="text-[9px] text-neutral-700 uppercase tracking-widest">Uptime</div>
          <div className="text-xs text-neutral-400 font-mono tabular-nums">
            {formatUptime(uptime)}
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-800" />

        <div className="text-right">
          <div className="text-[9px] text-neutral-700 uppercase tracking-widest">Data Source</div>
          <div className="text-[11px] text-neutral-400">Birdeye Enterprise API</div>
        </div>

        <div className="h-6 w-px bg-neutral-800" />

        <div className="text-right">
          <div className="text-[9px] text-neutral-700 uppercase tracking-widest">Execution</div>
          <div className="text-[11px] text-neutral-400">Jupiter v6</div>
        </div>

        <div className="h-6 w-px bg-neutral-800" />

        {/* Mock wallet */}
        <div className="flex items-center space-x-2.5 bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
          <div>
            <div className="text-[9px] text-neutral-600 uppercase tracking-widest leading-none mb-0.5">
              Wallet
            </div>
            <div className="text-[11px] text-neutral-300 font-mono">7xKX...t4Rp</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
