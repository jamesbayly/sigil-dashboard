import { useEffect, useState, useCallback } from "react";
import {
  getOpenPolymarketTrades,
  closeTrade,
  closeAllTrades,
} from "@/utils/api";
import { PolymarketTrades, isGenericResponse } from "@/types";
import { toast } from "sonner";

export const useOpenPolymarketTrades = () => {
  const [trades, setTrades] = useState<PolymarketTrades[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getOpenPolymarketTrades();
      if (isGenericResponse(res)) {
        setTrades([]);
        setError(new Error(res.message));
        toast.error(res.message);
      } else {
        setTrades(res);
      }
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch open trades");
      setError(newError);
      toast.error(newError.message);
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  const onClose = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await closeTrade(id);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to close trade");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }

    await fetchAll();
  };

  const onCloseAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await closeAllTrades();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to close all trades");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }

    await fetchAll();
  };

  return { trades, onClose, onCloseAll, isLoading, error, refetch: fetchAll };
};
