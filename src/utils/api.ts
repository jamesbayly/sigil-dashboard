import {
  GenericResponse,
  MarketState,
  Strategy,
  StrategyTestRunResponse,
  StrategyTestRunsResponse,
  Symbols,
  Trades,
} from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL;

export const getOpenTrades = async () => {
  const res = await fetch(`${BASE}/trade`);
  return (await res.json()) as Trades[] | GenericResponse;
};

export const closeTrade = async (id: number) => {
  const res = await fetch(`${BASE}/trade/${id}`, { method: "DELETE" });
  return (await res.json()) as Trades | GenericResponse;
};

export const closeAllTrades = async () => {
  const res = await fetch(`${BASE}/trade`, { method: "DELETE" });
  return (await res.json()) as Trades[] | GenericResponse;
};

export const getHistoricTrades = async (
  start: Date | undefined,
  end: Date | undefined,
  strategyId?: number,
  symbolId?: number
) => {
  const params = new URLSearchParams({});
  if (start) params.set("start", `${start.toISOString().slice(0, 10)}`);
  if (end) params.set("end", `${end.toISOString().slice(0, 10)}`);
  if (strategyId) params.set("strategy_id", `${strategyId}`);
  if (symbolId) params.set("symbol_id", `${symbolId}`);
  const res = await fetch(`${BASE}/trade/historic?${params.toString()}`);
  return (await res.json()) as Trades[] | GenericResponse;
};

export const getHistoricMarketState = async (
  start: Date | undefined,
  end: Date | undefined
) => {
  const params = new URLSearchParams({});
  if (start) params.set("start", `${start.toISOString().slice(0, 10)}`);
  if (end) params.set("end", `${end.toISOString().slice(0, 10)}`);
  const res = await fetch(`${BASE}/market/historic?${params.toString()}`);
  return (await res.json()) as MarketState[] | GenericResponse;
};

export const getStrategies = async () => {
  const res = await fetch(`${BASE}/strategy`);
  return (await res.json()) as Strategy[] | GenericResponse;
};

export const createStrategy = async (payload: Omit<Strategy, "id">) => {
  const res = await fetch(`${BASE}/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as Strategy | GenericResponse;
};

export const updateStrategy = async (payload: Partial<Strategy>) => {
  const res = await fetch(`${BASE}/strategy`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as Strategy | GenericResponse;
};

export const getSymbols = async () => {
  const res = await fetch(`${BASE}/symbol`);
  return (await res.json()) as Symbols[] | GenericResponse;
};

export const getTestRuns = async () => {
  const res = await fetch(`${BASE}/strategy/test`);
  return (await res.json()) as StrategyTestRunsResponse[] | GenericResponse;
};

export const getTestRun = async (testRunID: number) => {
  const res = await fetch(`${BASE}/strategy/test/${testRunID}`);
  return (await res.json()) as StrategyTestRunResponse | GenericResponse;
};

export const createTestRun = async (
  strategyID: number,
  permutation_count: number | undefined,
  symbol_ids: number[] | undefined
) => {
  const params = new URLSearchParams();
  if (permutation_count !== undefined) {
    params.set("permutation_count", permutation_count.toString());
  }
  if (symbol_ids !== undefined) {
    params.set("symbol_ids", symbol_ids.join(","));
  }
  const url = params.toString()
    ? `${BASE}/strategy/${strategyID}/test?${params.toString()}`
    : `${BASE}/strategy/${strategyID}/test`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return (await res.json()) as GenericResponse;
};

export const createTestRunForSymbol = async (
  strategyID: number,
  symbolID: number,
  permutation_count: number | undefined
) => {
  const res = await fetch(
    permutation_count
      ? `${BASE}/strategy/${strategyID}/test/${symbolID}?permutation_count=${permutation_count}`
      : `${BASE}/strategy/${strategyID}/test/${symbolID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  return (await res.json()) as GenericResponse;
};

export const deleteTestRun = async (testRunID: number) => {
  const res = await fetch(`${BASE}/strategy/test/${testRunID}`, {
    method: "DELETE",
  });
  return (await res.json()) as GenericResponse;
};

export const refreshTestRun = async (
  testRunID: number,
  permutationID: number | undefined
) => {
  const res = await fetch(
    permutationID
      ? `${BASE}/strategy/test/${testRunID}/results?permutation_id=${permutationID}`
      : `${BASE}/strategy/test/${testRunID}/results`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  return (await res.json()) as GenericResponse;
};
