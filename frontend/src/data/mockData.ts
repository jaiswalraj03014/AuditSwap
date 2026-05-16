import type { AuditGate, SwapRecord, SessionMetrics } from '../types';

export const GATE_DEFINITIONS: Omit<AuditGate, 'result' | 'value'>[] = [
  {
    id: 1,
    name: 'Mint Authority',
    description: 'Mint authority must be renounced',
    condition: 'Must be null',
  },
  {
    id: 2,
    name: 'Honeypot Score',
    description: 'Transfer simulation risk score',
    condition: '< 0.05 score',
  },
  {
    id: 3,
    name: 'Holder Concentration',
    description: 'Top 10 holders supply share',
    condition: 'Top 10 ≤ 30%',
  },
  {
    id: 4,
    name: 'Liquidity Depth',
    description: 'USD value locked in primary pool',
    condition: '> $50,000',
  },
];

const TOKEN_POOL = [
  { symbol: 'MOONCAT', name: 'Moon Cat Token' },
  { symbol: 'SAFEMEME', name: 'Safe Meme Protocol' },
  { symbol: 'DEGEN', name: 'Degen Finance' },
  { symbol: 'BONKX', name: 'BonkX Enhanced' },
  { symbol: 'MEMEAI', name: 'Meme AI Token' },
  { symbol: 'WIFHAT', name: 'Wif Hat Finance' },
  { symbol: 'PEPE2', name: 'Pepe Verse II' },
  { symbol: 'WAGMI', name: 'WAGMI Protocol' },
  { symbol: 'GIGA', name: 'Gigabrain Token' },
  { symbol: 'SOLCAT', name: 'Sol Cat Meme' },
  { symbol: 'FOMO99', name: 'FOMO Finance 99' },
  { symbol: 'APE2X', name: 'Ape Double' },
  { symbol: 'COPE', name: 'Cope Protocol' },
  { symbol: 'PUMP', name: 'Pump Finance' },
  { symbol: 'NGMI', name: 'NGMI Token' },
  { symbol: 'SOLGOD', name: 'Sol God Token' },
  { symbol: 'RUGTOK', name: 'Rug Token' },
  { symbol: 'HODLX', name: 'HODL Extended' },
  { symbol: 'MOONA', name: 'Moona Finance' },
  { symbol: 'CATDAO', name: 'Cat DAO Token' },
];

export function getRandomToken() {
  return TOKEN_POOL[Math.floor(Math.random() * TOKEN_POOL.length)];
}

export function buildGates(): AuditGate[] {
  return GATE_DEFINITIONS.map(g => ({ ...g, result: 'idle' as const }));
}

export function generateAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return Array.from(
    { length: 44 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function truncateTxHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

export function generateTxHash(): string {
  return Array.from(
    { length: 64 },
    () => '0123456789abcdef'[Math.floor(Math.random() * 16)],
  ).join('');
}

export function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export const initialSwapHistory: SwapRecord[] = [
  {
    id: 'init-1',
    symbol: 'WAGMI',
    address: '9pQmRt6nXwKtYzMvBsLjHgFdCvNkPrTs3mJhDqWe5f2b',
    amount: 0.5,
    timestamp: '14:18:44',
    txHash: 'a3f9e2d1c4b5a6e7f8d9c0b1a2e3f4d5c6b7a8e9f0d1c2b3a4e5f6d7c8b9a0e1',
    valueUsd: 52.11,
  },
  {
    id: 'init-2',
    symbol: 'BONKX',
    address: '3hJkNs2mBvYzKtXwQr7nPsLmFgHj9dCvBnMkRtYu8e1a',
    amount: 0.5,
    timestamp: '14:16:22',
    txHash: 'b4g0f3e2d5c6b7a8e9f0d1c2b3a4e5f6d7c8b9a0e1f2d3c4b5a6e7f8d9c0b1a2',
    valueUsd: 47.23,
  },
  {
    id: 'init-3',
    symbol: 'SOLCAT',
    address: '7mHkPq4rJvNsXwYzLtBdCgFhKmNpQrSvYzAbCdEfGhIj',
    amount: 0.5,
    timestamp: '14:14:09',
    txHash: 'c5h1g4f3e2d1c0b9a8e7f6d5c4b3a2e1f0d9c8b7a6e5f4d3c2b1a0e9f8d7c6b5',
    valueUsd: 38.74,
  },
  {
    id: 'init-4',
    symbol: 'GIGA',
    address: '4kLmNp8qRsTuVwXyZaBcDeFgHiJkLmNpQrStUvWxYzAb',
    amount: 0.5,
    timestamp: '14:11:53',
    txHash: 'd6i2h5g4f3e2d1c0b9a8e7f6d5c4b3a2e1f0d9c8b7a6e5f4d3c2b1a0e9f8d7c6',
    valueUsd: 61.08,
  },
];

export const initialMetrics: SessionMetrics = {
  tokensDetected: 94,
  passed: 11,
  rejected: 83,
  swapsExecuted: 11,
};
