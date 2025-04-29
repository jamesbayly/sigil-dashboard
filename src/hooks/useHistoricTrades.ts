import { useEffect, useState, useRef, useCallback } from "react";
import { getHistoricTrades } from "@/utils/api";
import { type Trades, isGenericResponse } from "@/types";
import { toast } from "sonner";

export const useHistoricTrades = (
  take = 25,
  strategyId?: number,
  symbolId?: number
) => {
  const [trades, setTrades] = useState<Trades[]>([]);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (isLoading || !hasMore) return;
    try {
      setIsLoading(true);
      const res = await getHistoricTrades(take, skip, strategyId, symbolId);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setTrades((x) => [...x, ...res]);
      setSkip((s) => s + take);
      if (res.length < take) setHasMore(false);
    } catch (err) {
      const newError =
        err instanceof Error
          ? err
          : new Error("Failed to fetch historic trades");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  }, [skip, take, isLoading, hasMore, strategyId, symbolId]);

  // infinite scroll via IntersectionObserver
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) load();
      },
      { rootMargin: "200px" }
    );
    if (sentinel.current) obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [load]);

  // reset if filters change
  useEffect(() => {
    setTrades([]);
    setSkip(0);
    setHasMore(true);
  }, [strategyId, symbolId]);

  return { trades, isLoading, error, sentinel };
};
