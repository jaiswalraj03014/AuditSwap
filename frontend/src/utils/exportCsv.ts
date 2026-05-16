import type { SwapRecord, TokenEntry } from '../types';

function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows
    .map(row =>
      row.map(cell => {
        const s = String(cell).replace(/"/g, '""');
        return /[,"\n\r]/.test(s) ? `"${s}"` : s;
      }).join(',')
    )
    .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSwapHistory(swaps: SwapRecord[]): void {
  const header = ['Timestamp', 'Symbol', 'Address', 'Amount (SOL)', 'Value (USD)', 'Tx Hash'];
  const rows = swaps.map(s => [
    s.timestamp,
    s.symbol,
    s.address,
    String(s.amount),
    s.valueUsd.toFixed(2),
    s.txHash,
  ]);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`auditswap-swaps-${date}.csv`, [header, ...rows]);
}

export function exportTokenFeed(feed: TokenEntry[]): void {
  const header = ['Discovered At', 'Symbol', 'Name', 'Address', 'Status', 'Reject Gate',
    'G1 Mint Authority', 'G2 Honeypot Score', 'G3 Holder Conc.', 'G4 Liquidity Depth'];
  const rows = feed.map(t => [
    t.discoveredAt,
    t.symbol,
    t.name,
    t.address,
    t.status,
    t.rejectGate != null ? String(t.rejectGate) : '',
    ...t.gates.map(g => (g.result === 'pass' || g.result === 'fail') ? (g.value ?? g.result) : g.result),
  ]);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`auditswap-feed-${date}.csv`, [header, ...rows]);
}
