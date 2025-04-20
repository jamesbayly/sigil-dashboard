const BASE = import.meta.env.VITE_API_BASE_URL;

export async function getOpenTrades() {
  const res = await fetch(`${BASE}/trade`);
  return res.json();
}

export async function closeTrade(id: number) {
  await fetch(`${BASE}/trade/${id}`, { method: "DELETE" });
}

export async function closeAllTrades() {
  await fetch(`${BASE}/trade`, { method: "DELETE" });
}

export async function getHistoricTrades(
  take: number,
  skip: number,
  strategyId?: number,
  symbolId?: number
) {
  const params = new URLSearchParams({ take: `${take}`, skip: `${skip}` });
  if (strategyId) params.set("strategy_id", `${strategyId}`);
  if (symbolId) params.set("symbol_id", `${symbolId}`);
  const res = await fetch(`${BASE}/trade/historic?${params.toString()}`);
  return res.json();
}

export async function getStrategies() {
  const res = await fetch(`${BASE}/strategy`);
  return res.json();
}
export async function createStrategy(payload: any) {
  const res = await fetch(`${BASE}/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
export async function updateStrategy(id: number, payload: any) {
  const res = await fetch(`${BASE}/strategy/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getSymbols() {
  const res = await fetch(`${BASE}/symbol`);
  return res.json();
}
