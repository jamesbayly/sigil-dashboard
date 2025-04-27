import { useEffect, useState, useCallback } from "react";
import { getOpenTrades, closeTrade, closeAllTrades } from "@/utils/api";
import type { Trades } from "@/types";

export function useOpenTrades() {
  const [trades, setTrades] = useState<Trades[]>([]);

  const fetchAll = useCallback(async () => {
    setTrades(await getOpenTrades());
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

  return { trades, onClose, onCloseAll };
}
