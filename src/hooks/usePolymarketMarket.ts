import { useState, useEffect, useCallback } from "react";
import { getPolymarketMarket, getPolymarketMarkets } from "@/utils/api";
import {
  PolymarketMarketResponse,
  PolymarketMarketsResponse,
  isGenericResponse,
} from "@/types";
import { toast } from "sonner";

export function usePolymarketMarket(marketId?: number) {
  const [marketInfo, setMarketInfo] =
    useState<PolymarketMarketsResponse | null>(null);
  const [marketTrades, setMarketTrades] =
    useState<PolymarketMarketResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarket = useCallback(async () => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch both the market list (to get full market info) and the specific market trades
      const [marketsResponse, tradesResponse] = await Promise.all([
        getPolymarketMarkets(),
        getPolymarketMarket(marketId),
      ]);

      // Handle market info
      if (isGenericResponse(marketsResponse)) {
        setError(new Error(marketsResponse.message));
        toast.error(marketsResponse.message);
        setMarketInfo(null);
      } else {
        const market = marketsResponse.find((m) => m.id === marketId);
        if (market) {
          setMarketInfo(market);
        } else {
          setError(new Error("Market not found"));
          toast.error("Market not found");
          setMarketInfo(null);
        }
      }

      // Handle trades
      if (isGenericResponse(tradesResponse)) {
        setError(new Error(tradesResponse.message));
        toast.error(tradesResponse.message);
        setMarketTrades(null);
      } else {
        setMarketTrades(tradesResponse);
        setError(null);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch Polymarket market: ${error.message}`);
      setMarketInfo(null);
      setMarketTrades(null);
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return { marketInfo, marketTrades, isLoading, error };
}
