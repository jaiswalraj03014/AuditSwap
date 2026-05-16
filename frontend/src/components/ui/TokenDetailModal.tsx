import type { FC } from 'react';
import type { TokenEntry, GateResult } from '../../types';

interface Props {
  token: TokenEntry | null;
  onClose: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  detected: 'text-neutral-500',
  auditing: 'text-amber-500 dark:text-amber-400',
  rejected: 'text-red-500',
  swapping: 'text-neutral-700 dark:text-neutral-300',
  swapped: 'text-neutral-900 dark:text-white',
};

const GATE_ICON: Record<GateResult, string> = {
  idle: '○',
  checking: '⟳',
  pass: '✓',
  fail: '✕',
};

const GATE_COLOR: Record<GateResult, string> = {
  idle: 'text-neutral-400 dark:text-neutral-700',
  checking: 'text-amber-500',
  pass: 'text-neutral-900 dark:text-white',
  fail: 'text-red-500',
};

const GATE_NAMES = ['Mint Authority', 'Honeypot Score', 'Holder Concentration', 'Liquidity Depth'];

const TokenDetailModal: FC<Props> = ({ token, onClose }) => {
  if (!token) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/60"
        onClick={onClose}
      />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[82vh] bg-[#f4f3ef] dark:bg-[#0d0d0d] border border-neutral-200 dark:border-neutral-800 rounded shadow-2xl flex flex-col overflow-hidden modal-enter">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <span className="text-sm font-bold text-neutral-900 dark:text-white tracking-[0.1em]">
                {token.symbol}
              </span>
              <span className={`text-[9px] uppercase tracking-widest font-bold ${STATUS_COLOR[token.status]}`}>
                {token.status}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500">{token.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 text-xl leading-none rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors mt-0.5"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Contract address */}
          <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-black/30">
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1.5">
              Contract Address
            </div>
            <div className="text-[10px] font-mono text-neutral-700 dark:text-neutral-300 break-all leading-relaxed">
              {token.address}
            </div>
          </div>

          {/* Meta row */}
          <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Discovered</div>
              <div className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                {token.discoveredAt}
              </div>
            </div>
            {token.rejectGate != null && (
              <div>
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Rejected At</div>
                <div className="text-[11px] font-mono text-red-500">
                  Gate {token.rejectGate} — {GATE_NAMES[token.rejectGate - 1]}
                </div>
              </div>
            )}
          </div>

          {/* Gate results */}
          <div className="px-6 py-4">
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-3">
              Security Audit Gates
            </div>
            <div>
              {token.gates.map(gate => (
                <div
                  key={gate.id}
                  className="flex items-center justify-between py-2.5 border-b border-neutral-200/50 dark:border-neutral-800/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-700 tabular-nums w-5 flex-shrink-0">
                      G{gate.id}
                    </span>
                    <div>
                      <div className="text-[10px] text-neutral-700 dark:text-neutral-300 font-semibold">
                        {gate.name}
                      </div>
                      <div className="text-[9px] text-neutral-400 dark:text-neutral-600">
                        {gate.condition}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {gate.value && gate.result !== 'idle' && gate.result !== 'checking' && (
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        {gate.value}
                      </span>
                    )}
                    <span className={`text-sm leading-none ${GATE_COLOR[gate.result]}`}>
                      {GATE_ICON[gate.result]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <p className="text-[9px] text-neutral-400 dark:text-neutral-600">
            Click outside to close · Security data via Birdeye /defi/token_security
          </p>
        </div>
      </div>
    </>
  );
};

export default TokenDetailModal;
