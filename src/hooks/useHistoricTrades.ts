import { useEffect, useState, useRef, useCallback } from "react";
import { getHistoricTrades } from "@/utils/api";
import type { Trades } from "@/types";

export function useHistoricTrades(
  take = 25,
  strategyId?: number,
  symbolId?: number
) {
  const [trades, setTrades] = useState<Trades[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinel = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const data = await getHistoricTrades(take, skip, strategyId, symbolId);
    setTrades((x) => [...x, ...data]);
    setSkip((s) => s + take);
    if (data.length < take) setHasMore(false);
    setLoading(false);
  }, [skip, take, loading, hasMore, strategyId, symbolId]);

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

  return { trades, loading, sentinel };
}
