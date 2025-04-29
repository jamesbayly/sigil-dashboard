import { useEffect, useState, useCallback } from "react";
import { getOpenTrades, closeTrade, closeAllTrades } from "@/utils/api";
import { isGenericResponse, type Trades } from "@/types";
import { toast } from "sonner";

export const useOpenTrades = () => {
  const [trades, setTrades] = useState<Trades[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getOpenTrades();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }
      setTrades(res);
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch open trades");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 10_000);
    return () => clearInterval(id);
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
