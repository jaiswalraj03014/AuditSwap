import { type FC, useState, useEffect } from 'react';
import { useSettings, DEFAULT_SETTINGS } from '../../contexts/SettingsContext';
import type { AuditSettings } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface InputRowProps {
  label: string;
  hint: string;
  prefix?: string;
  suffix?: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

const InputRow: FC<InputRowProps> = ({ label, hint, prefix, suffix, value, step = 1, min, max, onChange }) => (
  <div>
    <label className="block text-[9px] text-neutral-500 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full py-2 text-[11px] font-mono text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 transition-colors ${prefix ? 'pl-6' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
    <p className="text-[9px] text-neutral-400 dark:text-neutral-600 mt-1">{hint}</p>
  </div>
);

const SettingsDrawer: FC<Props> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [local, setLocal] = useState<AuditSettings>(settings);

  useEffect(() => {
    if (isOpen) setLocal(settings);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof AuditSettings>(key: K, val: AuditSettings[K]) =>
    setLocal(prev => ({ ...prev, [key]: val }));

  const handleApply = () => {
    updateSettings(local);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10 dark:bg-black/40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-[#f4f3ef] dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl settings-drawer">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase tracking-widest font-semibold">
              Engine Settings
            </div>
            <div className="text-[9px] text-neutral-400 dark:text-neutral-600 mt-0.5">
              Audit gate parameters
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 text-xl leading-none rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <InputRow
            label="Min Liquidity (USD)"
            hint="Gate 4 — liquidity depth threshold"
            prefix="$"
            value={local.minLiquidity}
            step={5000}
            min={0}
            onChange={v => set('minLiquidity', v)}
          />
          <InputRow
            label="Max Holder Concentration"
            hint="Gate 3 — top-10 holder share cap"
            suffix="%"
            value={local.maxHolderConc}
            step={1}
            min={1}
            max={100}
            onChange={v => set('maxHolderConc', v)}
          />
          <InputRow
            label="Honeypot Threshold"
            hint="Gate 2 — max transfer simulation risk (0–1)"
            value={local.honeypotThreshold}
            step={0.01}
            min={0}
            max={1}
            onChange={v => set('honeypotThreshold', v)}
          />
          <InputRow
            label="Swap Amount"
            hint="Jupiter v6 — per-trade position size"
            suffix="SOL"
            value={local.swapAmount}
            step={0.1}
            min={0.01}
            onChange={v => set('swapAmount', v)}
          />
          <InputRow
            label="Slippage"
            hint="Max acceptable price impact"
            suffix="%"
            value={local.slippage}
            step={0.1}
            min={0.1}
            max={50}
            onChange={v => set('slippage', v)}
          />

          <div className="border border-neutral-200 dark:border-neutral-800/80 rounded p-3 bg-neutral-100/50 dark:bg-neutral-900/30">
            <p className="text-[9px] text-neutral-500 dark:text-neutral-500 leading-relaxed">
              Changes apply to the next audit session. Any currently running audit uses its original parameters.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 flex-shrink-0">
          <button
            onClick={() => setLocal(DEFAULT_SETTINGS)}
            className="flex-1 py-2 text-[10px] uppercase tracking-widest font-semibold text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 text-[10px] uppercase tracking-widest font-semibold text-neutral-800 dark:text-white border border-neutral-700 dark:border-neutral-500 rounded hover:bg-neutral-800 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
