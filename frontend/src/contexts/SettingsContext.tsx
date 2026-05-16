import { createContext, useContext, useState, useRef, type ReactNode, type MutableRefObject } from 'react';
import type { AuditSettings } from '../types';

export const DEFAULT_SETTINGS: AuditSettings = {
  minLiquidity: 50000,
  maxHolderConc: 30,
  honeypotThreshold: 0.05,
  swapAmount: 0.5,
  slippage: 2.0,
};

interface SettingsContextValue {
  settings: AuditSettings;
  settingsRef: MutableRefObject<AuditSettings>;
  updateSettings: (s: AuditSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  settingsRef: { current: DEFAULT_SETTINGS },
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AuditSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef<AuditSettings>(DEFAULT_SETTINGS);

  const updateSettings = (s: AuditSettings) => {
    settingsRef.current = s;
    setSettings(s);
  };

  return (
    <SettingsContext.Provider value={{ settings, settingsRef, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
