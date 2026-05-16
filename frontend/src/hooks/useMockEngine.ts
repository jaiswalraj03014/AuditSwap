import { useState, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { TokenEntry, SwapRecord, SessionMetrics, EngineStatus, AuditGate, AuditSettings } from '../types';
import {
  getRandomToken,
  buildGates,
  generateAddress,
  getTimestamp,
  generateTxHash,
  initialSwapHistory,
  initialMetrics,
} from '../data/mockData';

const GATE_NAMES = ['Mint Authority', 'Honeypot Score', 'Holder Concentration', 'Liquidity Depth'];

function generateGateValue(gateId: number): string {
  switch (gateId) {
    case 1: return Math.random() > 0.35 ? 'RENOUNCED' : 'PRESENT';
    case 2: return (Math.random() * 0.1).toFixed(4);
    case 3: return (Math.random() * 55 + 8).toFixed(1) + '%';
    case 4: return '$' + Math.floor(Math.random() * 250000 + 8000).toLocaleString();
    default: return '—';
  }
}

function evaluateGate(gateId: number, value: string, settings: AuditSettings): 'pass' | 'fail' {
  switch (gateId) {
    case 1: return value === 'RENOUNCED' ? 'pass' : 'fail';
    case 2: return parseFloat(value) < settings.honeypotThreshold ? 'pass' : 'fail';
    case 3: return parseFloat(value.replace('%', '')) < settings.maxHolderConc ? 'pass' : 'fail';
    case 4: {
      const num = parseInt(value.replace(/[$,]/g, ''), 10);
      return num > settings.minLiquidity ? 'pass' : 'fail';
    }
    default: return 'fail';
  }
}

interface UseMockEngineOptions {
  settingsRef: MutableRefObject<AuditSettings>;
  onSwapExecuted: (symbol: string, valueUsd: number) => void;
  onTokenRejected: (symbol: string, gateNum: number, gateName: string) => void;
}

export function useMockEngine({ settingsRef, onSwapExecuted, onTokenRejected }: UseMockEngineOptions) {
  const [feed, setFeed] = useState<TokenEntry[]>([]);
  const [activeToken, setActiveToken] = useState<TokenEntry | null>(null);
  const [swapHistory, setSwapHistory] = useState<SwapRecord[]>(initialSwapHistory);
  const [metrics, setMetrics] = useState<SessionMetrics>(initialMetrics);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('SCANNING');
  const [uptime, setUptime] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const queueRef = useRef<TokenEntry[]>([]);
  const processRef = useRef<(token: TokenEntry) => void>(() => {});
  const isPausedRef = useRef(false);

  const onSwapRef = useRef(onSwapExecuted);
  const onRejectRef = useRef(onTokenRejected);
  onSwapRef.current = onSwapExecuted;
  onRejectRef.current = onTokenRejected;

  const pause = () => {
    isPausedRef.current = true;
    setIsPaused(true);
  };

  const resume = () => {
    isPausedRef.current = false;
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true; // re-arm after StrictMode double-invoke

    const sleep = (ms: number) =>
      new Promise<void>(resolve => setTimeout(resolve, ms));

    async function processAudit(token: TokenEntry) {
      processingRef.current = true;
      if (!mountedRef.current) { processingRef.current = false; return; }

      setEngineStatus('AUDITING');

      const workingGates: AuditGate[] = buildGates(settingsRef.current);
      setActiveToken({ ...token, status: 'auditing', gates: [...workingGates] });

      let allPassed = true;
      let failGate = -1;

      for (let i = 0; i < 4; i++) {
        if (!mountedRef.current) { processingRef.current = false; return; }

        workingGates[i] = { ...workingGates[i], result: 'checking' };
        setActiveToken(prev => prev ? { ...prev, gates: [...workingGates] } : prev);

        await sleep(380 + Math.random() * 440);
        if (!mountedRef.current) { processingRef.current = false; return; }

        const value = generateGateValue(i + 1);
        const result = evaluateGate(i + 1, value, settingsRef.current);

        workingGates[i] = { ...workingGates[i], result, value };
        setActiveToken(prev => prev ? { ...prev, gates: [...workingGates] } : prev);

        await sleep(200);
        if (!mountedRef.current) { processingRef.current = false; return; }

        if (result === 'fail') {
          allPassed = false;
          failGate = i + 1;
          break;
        }
      }

      await sleep(550);
      if (!mountedRef.current) { processingRef.current = false; return; }

      if (allPassed) {
        const swapAmount = settingsRef.current.swapAmount;
        setEngineStatus('EXECUTING');
        setActiveToken(prev => prev ? { ...prev, status: 'swapping' } : prev);

        await sleep(1100);
        if (!mountedRef.current) { processingRef.current = false; return; }

        const valueUsd = parseFloat((Math.random() * 130 + 12).toFixed(2));
        const swap: SwapRecord = {
          id: Date.now().toString(),
          symbol: token.symbol,
          address: token.address,
          amount: swapAmount,
          timestamp: getTimestamp(),
          txHash: generateTxHash(),
          valueUsd,
        };

        onSwapRef.current(token.symbol, valueUsd);
        setSwapHistory(prev => [swap, ...prev].slice(0, 20));
        setFeed(prev => prev.map(t => t.id === token.id ? { ...t, status: 'swapped' as const } : t));
        setActiveToken(prev => prev ? { ...prev, status: 'swapped' as const } : prev);
        setMetrics(prev => ({ ...prev, passed: prev.passed + 1, swapsExecuted: prev.swapsExecuted + 1 }));
      } else {
        onRejectRef.current(token.symbol, failGate, GATE_NAMES[failGate - 1]);
        setFeed(prev =>
          prev.map(t =>
            t.id === token.id ? { ...t, status: 'rejected' as const, rejectGate: failGate } : t,
          ),
        );
        setActiveToken(prev =>
          prev ? { ...prev, status: 'rejected' as const, rejectGate: failGate } : prev,
        );
        setMetrics(prev => ({ ...prev, rejected: prev.rejected + 1 }));
      }

      await sleep(900);
      if (!mountedRef.current) { processingRef.current = false; return; }

      processingRef.current = false;
      setEngineStatus('SCANNING');

      if (queueRef.current.length > 0 && !isPausedRef.current) {
        const next = queueRef.current.shift()!;
        setQueueLength(queueRef.current.length);
        processRef.current(next);
      }
    }

    processRef.current = processAudit;

    function addToken() {
      if (!mountedRef.current || isPausedRef.current) return;
      const info = getRandomToken();
      const token: TokenEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        address: generateAddress(),
        symbol: info.symbol,
        name: info.name,
        discoveredAt: getTimestamp(),
        status: 'detected',
        gates: buildGates(settingsRef.current),
      };

      setFeed(prev => [token, ...prev].slice(0, 30));
      setMetrics(prev => ({ ...prev, tokensDetected: prev.tokensDetected + 1 }));

      if (!processingRef.current) {
        processRef.current(token);
      } else {
        queueRef.current.push(token);
        setQueueLength(queueRef.current.length);
      }
    }

    const firstTimeout = setTimeout(addToken, 700);
    const interval = setInterval(addToken, 4800);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Uptime counter — pauses when engine is paused
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(t);
  }, [isPaused]);

  return { feed, activeToken, swapHistory, metrics, engineStatus, uptime, queueLength, isPaused, pause, resume };
}
