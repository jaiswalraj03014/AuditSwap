import { useState, useEffect } from 'react';
import './App.css'; // CRITICAL: This links your Tailwind directives!

interface LogEntry {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

export default function App() {
  const [status, setStatus] = useState<string>("SYSTEM BOOT...");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tokensScanned, setTokensScanned] = useState(0);

  useEffect(() => {
    const fetchSystemState = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setLogs(data.logs);
          setTokensScanned(prev => prev + (data.logs.some((l: LogEntry) => l.message.includes('Querying')) ? 1 : 0));
        }
      } catch (error) {
        setStatus("AWAITING BACKEND CONNECTION...");
      }
    };

    const interval = setInterval(fetchSystemState, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="film-grain"></div>

      <div className="w-full max-w-5xl bg-[#0a0a0c] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col h-[80vh]">
        
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#050505]">
          <div className="flex flex-col">
            <h1 className="text-white font-bold tracking-widest text-lg uppercase">AuditSwap // Core</h1>
            <span className="text-[10px] text-neutral-500 tracking-widest mt-1">Autonomous Settlement Engine</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] text-neutral-500 uppercase">Network</span>
              <span className="text-xs text-neutral-300">Solana Mainnet</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#111] border border-neutral-800 px-4 py-2 rounded-md shadow-inner">
              <div className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse"></div>
              <span className="text-xs text-white uppercase tracking-wider font-semibold">{status}</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          
          <div className="flex-1 border-r border-neutral-800 bg-[#020202] p-6 overflow-y-auto flex flex-col-reverse">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-neutral-600 text-xs tracking-wider">// Waiting for initial payload from Birdeye...</div>
              ) : (
                logs.map((log, idx) => {
                  let colorClass = "text-neutral-400";
                  if (log.type === 'SUCCESS') colorClass = "text-white font-medium";
                  if (log.type === 'WARN') colorClass = "text-neutral-500 italic";
                  if (log.type === 'ERROR') colorClass = "text-red-500/80";

                  return (
                    <div key={idx} className={`text-xs flex space-x-3 ${colorClass} tracking-wide`}>
                      <span className="text-neutral-600 w-20 flex-shrink-0">[{log.timestamp}]</span>
                      <span className="w-16 flex-shrink-0">[{log.type}]</span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="w-80 bg-[#08080a] p-6 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-2">Data Source</h3>
                <div className="text-sm text-neutral-300 font-semibold tracking-wide">Birdeye Enterprise API</div>
                <div className="text-xs text-neutral-500 mt-1">/v2/tokens/new_listing</div>
                <div className="text-xs text-neutral-500">/defi/token_security</div>
              </div>

              <div>
                <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-2">Session Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Tokens Mapped</div>
                    <div className="text-xl text-white font-light">{tokensScanned}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Slippage Guard</div>
                    <div className="text-xl text-white font-light">2.0%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-neutral-800 p-4 rounded bg-[#050505]">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Execution Protocol</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Evaluating chain state via Markovian metrics. Non-compliant contracts are immediately discarded.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}