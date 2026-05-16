import './App.css';
import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './components/ui/Toast';
import { useMockEngine } from './hooks/useMockEngine';
import Header from './components/layout/Header';
import LiveFeed from './components/dashboard/LiveFeed';
import AuditPanel from './components/dashboard/AuditPanel';
import MetricsPanel from './components/dashboard/MetricsPanel';
import SettingsDrawer from './components/ui/SettingsDrawer';
import TokenDetailModal from './components/ui/TokenDetailModal';
import type { TokenEntry } from './types';

function Dashboard() {
  const { settings, settingsRef } = useSettings();
  const { addToast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenEntry | null>(null);

  const { feed, activeToken, swapHistory, metrics, engineStatus, uptime, queueLength, isPaused, pause, resume } =
    useMockEngine({
      settingsRef,
      onSwapExecuted: (symbol, valueUsd) => {
        addToast('success', 'Swap Confirmed', `${symbol} · $${valueUsd.toFixed(2)} · ${settings.swapAmount} SOL deployed`);
      },
      onTokenRejected: (symbol, gateNum, gateName) => {
        addToast('error', 'Token Rejected', `${symbol} failed Gate ${gateNum} — ${gateName}`);
      },
    });

  return (
    <div className="h-screen w-screen bg-[#f4f3ef] dark:bg-[#050505] text-neutral-800 dark:text-neutral-300 flex flex-col overflow-hidden">
      <div className="film-grain" />

      <Header
        status={engineStatus}
        uptime={uptime}
        queueLength={queueLength}
        isPaused={isPaused}
        onPauseToggle={() => (isPaused ? resume() : pause())}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-[#eceae5] dark:bg-[#08080a] flex flex-col overflow-hidden">
          <LiveFeed feed={feed} onTokenSelect={setSelectedToken} />
        </div>

        <div className="flex-1 border-r border-neutral-200 dark:border-neutral-800 bg-[#f9f8f5] dark:bg-[#020202] flex flex-col overflow-hidden">
          <AuditPanel token={activeToken} engineStatus={engineStatus} />
        </div>

        <div className="w-72 bg-[#eceae5] dark:bg-[#08080a] flex flex-col overflow-hidden flex-shrink-0">
          <MetricsPanel metrics={metrics} swapHistory={swapHistory} />
        </div>
      </main>

      <footer className="h-7 border-t border-neutral-200 dark:border-neutral-800 bg-[#f4f3ef] dark:bg-[#050505] flex items-center px-5 justify-between flex-shrink-0">
        <div className="flex items-center space-x-5">
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600">AuditSwap v1.0.0-beta</span>
          <span className="text-neutral-300 dark:text-neutral-700 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600">
            Birdeye Enterprise API · Jupiter v6 · Solana Mainnet
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600">Mock data — awaiting backend</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600 tabular-nums">
            {metrics.tokensDetected} processed
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600">Slippage: {settings.slippage}%</span>
          <span className="text-neutral-300 dark:text-neutral-700 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600">Swap: {settings.swapAmount} SOL</span>
        </div>
      </footer>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <TokenDetailModal token={selectedToken} onClose={() => setSelectedToken(null)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ToastProvider>
          <Dashboard />
        </ToastProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
