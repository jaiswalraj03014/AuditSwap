import type { FC } from 'react';
import type { TokenEntry, AuditGate, GateResult, EngineStatus } from '../../types';
import { truncateAddress } from '../../data/mockData';

interface Props {
  token: TokenEntry | null;
  engineStatus: EngineStatus;
}

// ── Gate row ────────────────────────────────────────────────────────────────

interface GateRowProps {
  gate: AuditGate;
  index: number;
}

const RESULT_CONFIG: Record<GateResult, { icon: string; iconClass: string; rowClass: string }> = {
  idle: {
    icon: '○',
    iconClass: 'text-neutral-700',
    rowClass: 'opacity-40',
  },
  checking: {
    icon: '⟳',
    iconClass: 'text-amber-500/80 animate-spin-slow',
    rowClass: 'opacity-100',
  },
  pass: {
    icon: '✓',
    iconClass: 'text-white',
    rowClass: 'opacity-100',
  },
  fail: {
    icon: '✕',
    iconClass: 'text-red-500/80',
    rowClass: 'opacity-100',
  },
};

const RESULT_LABEL: Record<GateResult, { label: string; labelClass: string }> = {
  idle: { label: 'IDLE', labelClass: 'text-neutral-700' },
  checking: { label: 'CHECKING', labelClass: 'text-amber-500/80' },
  pass: { label: 'PASS', labelClass: 'text-white' },
  fail: { label: 'FAIL', labelClass: 'text-red-500/80' },
};

const GateRow: FC<GateRowProps> = ({ gate, index }) => {
  const res = RESULT_CONFIG[gate.result];
  const lbl = RESULT_LABEL[gate.result];

  return (
    <div
      className={`grid grid-cols-[2rem_1fr_1fr_1fr_5rem] items-center gap-4 px-5 py-3.5 border-b border-neutral-800/60 transition-opacity duration-300 ${res.rowClass}`}
    >
      {/* Gate number */}
      <div className="text-[10px] text-neutral-700 font-semibold tabular-nums">
        G{index + 1}
      </div>

      {/* Gate name + description */}
      <div>
        <div className="text-[11px] text-neutral-300 font-semibold tracking-wide">
          {gate.name}
        </div>
        <div className="text-[9px] text-neutral-700 mt-0.5">{gate.description}</div>
      </div>

      {/* Condition */}
      <div className="text-[10px] text-neutral-600 font-mono">{gate.condition}</div>

      {/* Measured value */}
      <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
        {gate.result === 'idle' ? (
          <span className="text-neutral-800">—</span>
        ) : gate.result === 'checking' ? (
          <span className="text-amber-500/60">measuring...</span>
        ) : (
          gate.value ?? '—'
        )}
      </div>

      {/* Result */}
      <div className="flex items-center space-x-1.5 justify-end">
        <span className={`text-sm leading-none ${res.iconClass}`}>{res.icon}</span>
        <span className={`text-[9px] font-bold tracking-widest uppercase ${lbl.labelClass}`}>
          {lbl.label}
        </span>
      </div>
    </div>
  );
};

// ── Idle / scanning state ───────────────────────────────────────────────────

const IdleState: FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-6">
      <div className="w-px h-12 bg-gradient-to-b from-transparent via-neutral-700 to-transparent mx-auto mb-4" />
      <div className="flex items-center justify-center space-x-1 mb-2">
        <div className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
    <p className="text-[11px] text-neutral-600 tracking-widest uppercase mb-1">
      Nexus Engine Operational
    </p>
    <p className="text-[10px] text-neutral-800 tracking-wide">
      Monitoring Birdeye stream · Awaiting next token...
    </p>
    <div className="mt-8 border border-neutral-800/50 rounded p-4 max-w-xs text-left">
      <p className="text-[9px] text-neutral-700 leading-relaxed">
        When a new token is detected, the engine will evaluate it across 4
        sequential security gates. Any single failure aborts the audit and
        discards the token.
      </p>
    </div>
  </div>
);

// ── Outcome banner ──────────────────────────────────────────────────────────

const OutcomeBanner: FC<{ token: TokenEntry }> = ({ token }) => {
  if (token.status === 'swapping') {
    return (
      <div className="mx-5 mb-4 border border-neutral-700/50 rounded p-4 bg-neutral-900/50">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] text-white font-bold tracking-widest uppercase">
            All Gates Passed — Executing Swap
          </span>
        </div>
        <div className="space-y-1 text-[10px] text-neutral-500">
          <div>→ Fetching quote from Jupiter v6 /quote</div>
          <div>→ Swap amount: 0.50 SOL · Slippage: 2.0%</div>
          <div className="flex items-center space-x-1">
            <span>→ Signing &amp; submitting transaction</span>
            <span className="text-neutral-700 animate-pulse">...</span>
          </div>
        </div>
      </div>
    );
  }

  if (token.status === 'swapped') {
    return (
      <div className="mx-5 mb-4 border border-white/10 rounded p-4 bg-white/[0.02]">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-white text-sm">✓</span>
          <span className="text-[10px] text-white font-bold tracking-widest uppercase">
            Swap Confirmed On-Chain
          </span>
        </div>
        <div className="text-[10px] text-neutral-600">
          Token acquired · 0.50 SOL deployed via Jupiter v6 atomic swap
        </div>
      </div>
    );
  }

  if (token.status === 'rejected' && token.rejectGate) {
    const gateNames = ['Mint Authority', 'Honeypot Score', 'Holder Concentration', 'Liquidity Depth'];
    return (
      <div className="mx-5 mb-4 border border-red-900/30 rounded p-4 bg-red-950/10">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-red-500/80 text-sm">✕</span>
          <span className="text-[10px] text-red-500/80 font-bold tracking-widest uppercase">
            Rejected at Gate {token.rejectGate} — {gateNames[token.rejectGate - 1]}
          </span>
        </div>
        <div className="text-[10px] text-neutral-700">
          Audit aborted · No swap executed · Token discarded
        </div>
      </div>
    );
  }

  return null;
};

// ── Column headers ──────────────────────────────────────────────────────────

const TableHeader: FC = () => (
  <div className="grid grid-cols-[2rem_1fr_1fr_1fr_5rem] items-center gap-4 px-5 py-2 border-b border-neutral-800 flex-shrink-0">
    <div className="text-[9px] text-neutral-700 uppercase tracking-widest">#</div>
    <div className="text-[9px] text-neutral-700 uppercase tracking-widest">Gate</div>
    <div className="text-[9px] text-neutral-700 uppercase tracking-widest">Condition</div>
    <div className="text-[9px] text-neutral-700 uppercase tracking-widest">Measured Value</div>
    <div className="text-[9px] text-neutral-700 uppercase tracking-widest text-right">Result</div>
  </div>
);

// ── Progress bar ────────────────────────────────────────────────────────────

const ProgressBar: FC<{ gates: AuditGate[] }> = ({ gates }) => {
  const done = gates.filter(g => g.result === 'pass' || g.result === 'fail').length;
  const passed = gates.filter(g => g.result === 'pass').length;
  const pct = (done / 4) * 100;

  return (
    <div className="px-5 py-3 border-t border-neutral-800 flex items-center space-x-4 flex-shrink-0">
      <div className="flex-1 h-px bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-neutral-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-neutral-600 tabular-nums flex-shrink-0">
        {passed}/{4} passed
      </span>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────

const AuditPanel: FC<Props> = ({ token, engineStatus }) => {
  const isActive = token !== null;
  const gatesComplete =
    token?.status === 'rejected' || token?.status === 'swapping' || token?.status === 'swapped';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
              Audit Engine
            </span>
            {isActive && (
              <>
                <span className="text-neutral-700 text-xs">/</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {token.symbol}
                </span>
              </>
            )}
          </div>
          {isActive ? (
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-neutral-700 font-mono">
                {truncateAddress(token.address)}
              </span>
              <span className="text-neutral-800 text-[9px]">·</span>
              <span className="text-[9px] text-neutral-700">{token.name}</span>
            </div>
          ) : (
            <p className="text-[9px] text-neutral-700">4-Gate sequential security filter</p>
          )}
        </div>

        {/* Engine status pill */}
        <div className="flex items-center space-x-2 border border-neutral-800 rounded px-3 py-1.5 bg-[#050505]">
          {engineStatus === 'AUDITING' && (
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
          )}
          {engineStatus === 'EXECUTING' && (
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
          )}
          {engineStatus === 'SCANNING' && (
            <div className="w-1 h-1 rounded-full bg-neutral-600 animate-pulse" />
          )}
          <span className="text-[9px] text-neutral-500 uppercase tracking-widest">
            {engineStatus}
          </span>
        </div>
      </div>

      {/* Main content */}
      {!isActive ? (
        <IdleState />
      ) : (
        <>
          <TableHeader />

          <div className="flex-1 overflow-y-auto">
            {token.gates.map((gate, idx) => (
              <GateRow key={gate.id} gate={gate} index={idx} />
            ))}
          </div>

          {gatesComplete && <OutcomeBanner token={token} />}

          <ProgressBar gates={token.gates} />
        </>
      )}

      {/* Birdeye + Jupiter attribution */}
      <div className="px-5 py-2 border-t border-neutral-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-[9px] text-neutral-800">
            Security data: Birdeye /defi/token_security
          </span>
          <span className="text-neutral-800 text-[9px]">·</span>
          <span className="text-[9px] text-neutral-800">
            Swap: Jupiter v6 /quote → /swap
          </span>
        </div>
        <span className="text-[9px] text-neutral-800">Slippage: 2.0%</span>
      </div>
    </div>
  );
};

export default AuditPanel;
