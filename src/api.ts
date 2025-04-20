// src/api.ts
export interface Trade {
  id: number;
  strategy_id: number;
  symbol_id: number;
  size: number;
  open_time: string;
  open_price: number;
  open_notes: string;
  open_fees: number;
  open_binance_order_id?: string;
  take_profit_price?: number;
  stop_loss_percent?: number;
  close_time?: string;
  close_price?: number;
  close_notes?: string;
  close_fees?: number;
  close_binance_order_id?: string;
  fees?: number;
  pnl_amount_fee_exclusive?: number;
  pnl_percent?: number;
  pnl_amount?: number;
}

export interface Strategy {
  id: number;
  code: string;
  description: string;
  value: number;
  type: "integer" | "float" | "boolean";
  min_value?: number;
  max_value?: number;
}

export interface Symbol {
  id: number;
  name: string;
  symbol: string;
  binance_ticker: string;
  market_cap?: number;
  day_change_percent: number;
  hour_change_percent: number;
  cg_rank?: number;
  cg_id: string;
}

const BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchOpenTrades(): Promise<Trade[]> {
  const res = await fetch(`${BASE}/trade`);
  if (!res.ok) throw new Error("Failed to fetch open trades");
  return res.json();
}

export async function closeTrade(id: number): Promise<void> {
  const res = await fetch(`${BASE}/trade/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to close trade");
}

export async function closeAllTrades(): Promise<void> {
  const res = await fetch(`${BASE}/trade`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to close all trades");
}

export async function fetchHistoricTrades(
  take: number,
  skip: number,
  strategyId?: number,
  symbolId?: number
): Promise<Trade[]> {
  const params = new URLSearchParams({
    take: String(take),
    skip: String(skip),
  });
  if (strategyId) params.set("strategy_id", String(strategyId));
  if (symbolId) params.set("symbol_id", String(symbolId));
  const res = await fetch(`${BASE}/trade/history?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchStrategies(): Promise<Strategy[]> {
  const res = await fetch(`${BASE}/strategy`);
  if (!res.ok) throw new Error("Failed to fetch strategies");
  return res.json();
}

export async function createStrategy(data: Omit<Strategy, "id">) {
  const res = await fetch(`${BASE}/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create strategy");
  return res.json();
}

export async function updateStrategy(id: number, data: Omit<Strategy, "id">) {
  const res = await fetch(`${BASE}/strategy/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update strategy");
  return res.json();
}

export async function fetchSymbols(): Promise<Symbol[]> {
  const res = await fetch(`${BASE}/symbol`);
  if (!res.ok) throw new Error("Failed to fetch symbols");
  return res.json();
}
