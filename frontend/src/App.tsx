import './App.css';
import { useMockEngine } from './hooks/useMockEngine';
import Header from './components/layout/Header';
import LiveFeed from './components/dashboard/LiveFeed';
import AuditPanel from './components/dashboard/AuditPanel';
import MetricsPanel from './components/dashboard/MetricsPanel';

export default function App() {
  const { feed, activeToken, swapHistory, metrics, engineStatus, uptime, queueLength } =
    useMockEngine();

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col overflow-hidden">
      {/* Cinematic overlay */}
      <div className="film-grain" />

      {/* Top bar */}
      <Header status={engineStatus} uptime={uptime} queueLength={queueLength} />

      {/* Main 3-column layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left — live token feed */}
        <div className="w-64 border-r border-neutral-800 flex-shrink-0 bg-[#08080a] flex flex-col overflow-hidden">
          <LiveFeed feed={feed} />
        </div>

        {/* Center — active audit panel */}
        <div className="flex-1 border-r border-neutral-800 bg-[#020202] flex flex-col overflow-hidden">
          <AuditPanel token={activeToken} engineStatus={engineStatus} />
        </div>

        {/* Right — metrics + swap history */}
        <div className="w-72 bg-[#08080a] flex flex-col overflow-hidden flex-shrink-0">
          <MetricsPanel metrics={metrics} swapHistory={swapHistory} />
        </div>
      </main>

      {/* Footer status bar */}
      <footer className="h-7 border-t border-neutral-800 bg-[#050505] flex items-center px-5 justify-between flex-shrink-0">
        <div className="flex items-center space-x-5">
          <span className="text-[9px] text-neutral-800">
            AuditSwap v1.0.0-beta
          </span>
          <span className="text-neutral-800 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-800">
            Birdeye Enterprise API · Jupiter v6 · Solana Mainnet
          </span>
          <span className="text-neutral-800 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-800">
            Mock data — awaiting backend
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[9px] text-neutral-800 tabular-nums">
            {metrics.tokensDetected} processed
          </span>
          <span className="text-neutral-800 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-800">
            Slippage: 2.0%
          </span>
          <span className="text-neutral-800 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-800">
            Swap: 0.50 SOL
          </span>
        </div>
      </footer>
    </div>
  );
}
