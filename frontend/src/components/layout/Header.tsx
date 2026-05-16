import type { FC } from 'react';
import type { EngineStatus } from '../../types';
import { formatUptime } from '../../data/mockData';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  status: EngineStatus;
  uptime: number;
  queueLength: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSettingsClick: () => void;
}

const STATUS_CONFIG: Record<EngineStatus, { dot: string; text: string; label: string }> = {
  SCANNING: {
    dot: 'bg-neutral-500 dark:bg-neutral-400 animate-pulse',
    text: 'text-neutral-600 dark:text-neutral-400',
    label: 'SCANNING',
  },
  AUDITING: {
    dot: 'bg-amber-500 animate-pulse',
    text: 'text-amber-600 dark:text-amber-500',
    label: 'AUDITING',
  },
  EXECUTING: {
    dot: 'bg-neutral-900 dark:bg-white animate-pulse',
    text: 'text-neutral-900 dark:text-white',
    label: 'EXECUTING',
  },
  IDLE: {
    dot: 'bg-neutral-400 dark:bg-neutral-700',
    text: 'text-neutral-500 dark:text-neutral-600',
    label: 'IDLE',
  },
};

const SunIcon: FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
    <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
    <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const GearIcon: FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PauseIcon: FC = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const PlayIcon: FC = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const Header: FC<Props> = ({ status, uptime, queueLength, isPaused, onPauseToggle, onSettingsClick }) => {
  const { theme, toggle } = useTheme();
  const cfg = STATUS_CONFIG[isPaused ? 'IDLE' : status];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-[#f4f3ef] dark:bg-[#050505] flex-shrink-0 z-10">
      {/* Brand + Status + Controls */}
      <div className="flex items-center space-x-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-neutral-900 dark:text-white font-bold tracking-[0.2em] text-sm uppercase">
              AuditSwap
            </span>
            <span className="text-neutral-400 dark:text-neutral-700 text-sm font-light">//</span>
            <span className="text-neutral-500 text-[11px] tracking-widest uppercase font-medium">
              Nexus Engine
            </span>
          </div>
          <p className="text-[9px] text-neutral-500 tracking-widest mt-0.5">
            Autonomous Risk-Gated Settlement · Solana Mainnet
          </p>
        </div>

        <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* Engine status */}
        <div className="flex items-center space-x-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-neutral-400 dark:bg-neutral-700' : cfg.dot}`} />
          <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isPaused ? 'text-neutral-500 dark:text-neutral-600' : cfg.text}`}>
            {isPaused ? 'PAUSED' : cfg.label}
          </span>
        </div>

        {queueLength > 0 && (
          <div className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded">
            <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase tracking-widest">Queue</span>
            <span className="text-[10px] text-neutral-700 dark:text-neutral-400 font-semibold">{queueLength}</span>
          </div>
        )}

        <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* Pause / Resume */}
        <button
          onClick={onPauseToggle}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded border transition-colors ${
            isPaused
              ? 'border-amber-400/50 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 hover:bg-amber-100/60 dark:hover:bg-amber-950/30'
              : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
          title={isPaused ? 'Resume engine' : 'Pause engine'}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
          <span className="text-[9px] uppercase tracking-widest font-semibold">
            {isPaused ? 'Resume' : 'Pause'}
          </span>
        </button>
      </div>

      {/* Right meta */}
      <div className="flex items-center space-x-5">
        <div className="text-right">
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest">Uptime</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 font-mono tabular-nums">
            {formatUptime(uptime)}
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="text-right">
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest">Data Source</div>
          <div className="text-[11px] text-neutral-600 dark:text-neutral-400">Birdeye Enterprise API</div>
        </div>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="text-right">
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest">Execution</div>
          <div className="text-[11px] text-neutral-600 dark:text-neutral-400">Jupiter v6</div>
        </div>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="flex items-center space-x-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-150 px-2 py-1 rounded border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
          title="Engine settings"
        >
          <GearIcon />
          <span className="text-[9px] uppercase tracking-widest font-medium">Settings</span>
        </button>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center space-x-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-150 px-2 py-1 rounded border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span className="text-[9px] uppercase tracking-widest font-medium">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* Mock wallet */}
        <div className="flex items-center space-x-2.5 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
          <div>
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest leading-none mb-0.5">
              Wallet
            </div>
            <div className="text-[11px] text-neutral-700 dark:text-neutral-300 font-mono">7xKX...t4Rp</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
