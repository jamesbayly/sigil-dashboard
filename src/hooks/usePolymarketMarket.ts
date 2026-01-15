import { useState, useEffect, useCallback } from "react";
import { getPolymarketMarket } from "@/utils/api";
import { PolymarketMarketResponse, isGenericResponse } from "@/types";
import { toast } from "sonner";

export function usePolymarketMarket(marketId?: number) {
  const [marketInfo, setMarketInfo] = useState<PolymarketMarketResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarket = useCallback(async () => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch the specific market info
      const marketsResponse = await getPolymarketMarket(marketId);

      // Handle market info
      if (isGenericResponse(marketsResponse)) {
        setError(new Error(marketsResponse.message));
        toast.error(marketsResponse.message);
        setMarketInfo(null);
      } else {
        const market = marketsResponse;
        if (market) {
          setMarketInfo(market);
        } else {
          setError(new Error("Market not found"));
          toast.error("Market not found");
          setMarketInfo(null);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch Polymarket market: ${error.message}`);
      setMarketInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return { marketInfo, isLoading, error };
}
