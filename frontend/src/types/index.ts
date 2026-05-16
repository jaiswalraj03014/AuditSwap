export type GateResult = 'idle' | 'checking' | 'pass' | 'fail';

export type TokenStatus =
  | 'detected'
  | 'auditing'
  | 'rejected'
  | 'swapping'
  | 'swapped';

export type EngineStatus = 'SCANNING' | 'AUDITING' | 'EXECUTING' | 'IDLE';

export interface AuditGate {
  id: number;
  name: string;
  description: string;
  condition: string;
  result: GateResult;
  value?: string;
}

export interface TokenEntry {
  id: string;
  address: string;
  symbol: string;
  name: string;
  discoveredAt: string;
  status: TokenStatus;
  rejectGate?: number;
  gates: AuditGate[];
}

export interface SessionMetrics {
  tokensDetected: number;
  passed: number;
  rejected: number;
  swapsExecuted: number;
}

export interface SwapRecord {
  id: string;
  symbol: string;
  address: string;
  amount: number;
  timestamp: string;
  txHash: string;
  valueUsd: number;
}

export interface AuditSettings {
  minLiquidity: number;
  maxHolderConc: number;
  honeypotThreshold: number;
  swapAmount: number;
  slippage: number;
}
