import { useState, useEffect, useRef } from 'react';
import type { TokenEntry, SwapRecord, SessionMetrics, EngineStatus, AuditGate } from '../types';
import {
  getRandomToken,
  buildGates,
  generateAddress,
  getTimestamp,
  generateTxHash,
  initialSwapHistory,
  initialMetrics,
} from '../data/mockData';

function generateGateValue(gateId: number): string {
  switch (gateId) {
    case 1:
      return Math.random() > 0.35 ? 'RENOUNCED' : 'PRESENT';
    case 2:
      return (Math.random() * 0.1).toFixed(4);
    case 3:
      return (Math.random() * 55 + 8).toFixed(1) + '%';
    case 4:
      return '$' + Math.floor(Math.random() * 250000 + 8000).toLocaleString();
    default:
      return '—';
  }
}

function evaluateGate(gateId: number, value: string): 'pass' | 'fail' {
  switch (gateId) {
    case 1:
      return value === 'RENOUNCED' ? 'pass' : 'fail';
    case 2:
      return parseFloat(value) < 0.05 ? 'pass' : 'fail';
    case 3:
      return parseFloat(value.replace('%', '')) < 30 ? 'pass' : 'fail';
    case 4: {
      const num = parseInt(value.replace(/[$,]/g, ''), 10);
      return num > 50000 ? 'pass' : 'fail';
    }
    default:
      return 'fail';
  }
}

export function useMockEngine() {
  const [feed, setFeed] = useState<TokenEntry[]>([]);
  const [activeToken, setActiveToken] = useState<TokenEntry | null>(null);
  const [swapHistory, setSwapHistory] = useState<SwapRecord[]>(initialSwapHistory);
  const [metrics, setMetrics] = useState<SessionMetrics>(initialMetrics);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('SCANNING');
  const [uptime, setUptime] = useState(0);
  const [queueLength, setQueueLength] = useState(0);

  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const queueRef = useRef<TokenEntry[]>([]);
  const processRef = useRef<(token: TokenEntry) => void>(() => {});

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Core audit engine — runs inside a single stable useEffect to avoid stale closures
  useEffect(() => {
    const sleep = (ms: number) =>
      new Promise<void>(resolve => setTimeout(resolve, ms));

    async function processAudit(token: TokenEntry) {
      processingRef.current = true;
      if (!mountedRef.current) { processingRef.current = false; return; }

      setEngineStatus('AUDITING');

      const workingGates: AuditGate[] = buildGates();
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
        const result = evaluateGate(i + 1, value);

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
        setEngineStatus('EXECUTING');
        setActiveToken(prev => prev ? { ...prev, status: 'swapping' } : prev);

        await sleep(1100);
        if (!mountedRef.current) { processingRef.current = false; return; }

        const swap: SwapRecord = {
          id: Date.now().toString(),
          symbol: token.symbol,
          address: token.address,
          amount: 0.5,
          timestamp: getTimestamp(),
          txHash: generateTxHash(),
          valueUsd: parseFloat((Math.random() * 130 + 12).toFixed(2)),
        };

        setSwapHistory(prev => [swap, ...prev].slice(0, 20));
        setFeed(prev =>
          prev.map(t => t.id === token.id ? { ...t, status: 'swapped' as const } : t),
        );
        setActiveToken(prev => prev ? { ...prev, status: 'swapped' as const } : prev);
        setMetrics(prev => ({
          ...prev,
          passed: prev.passed + 1,
          swapsExecuted: prev.swapsExecuted + 1,
        }));
      } else {
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

      if (queueRef.current.length > 0) {
        const next = queueRef.current.shift()!;
        setQueueLength(queueRef.current.length);
        processRef.current(next);
      }
    }

    processRef.current = processAudit;

    function addToken() {
      if (!mountedRef.current) return;
      const info = getRandomToken();
      const token: TokenEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        address: generateAddress(),
        symbol: info.symbol,
        name: info.name,
        discoveredAt: getTimestamp(),
        status: 'detected',
        gates: buildGates(),
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

  // Uptime counter
  useEffect(() => {
    const t = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return { feed, activeToken, swapHistory, metrics, engineStatus, uptime, queueLength };
}
