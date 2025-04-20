import { useEffect, useState, useCallback } from "react";
import {
  getOpenTrades,
  closeTrade,
  closeAllTrades,
  getStrategies,
  getSymbols,
} from "@/utils/api";
import type { Trades, Strategy, Symbols } from "@/types";

export function useOpenTrades() {
  const [trades, setTrades] = useState<Trades[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [symbols, setSymbols] = useState<Symbols[]>([]);

  const fetchAll = useCallback(async () => {
    const [t, s, sy] = await Promise.all([
      getOpenTrades(),
      getStrategies(),
      getSymbols(),
    ]);
    setTrades(t);
    setStrategies(s);
    setSymbols(sy);
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 10_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const onClose = async (id: number) => {
    await closeTrade(id);
    await fetchAll();
  };
  const onCloseAll = async () => {
    await closeAllTrades();
    await fetchAll();
  };

  return { trades, strategies, symbols, onClose, onCloseAll };
}
