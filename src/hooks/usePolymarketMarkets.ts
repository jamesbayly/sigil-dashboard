import { useState, useEffect } from "react";
import { getPolymarketMarkets } from "@/utils/api";
import { PolymarketMarketsResponse, isGenericResponse } from "@/types";
import { toast } from "sonner";

export function usePolymarketMarkets() {
  const [markets, setMarkets] = useState<PolymarketMarketsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const response = await getPolymarketMarkets();

        if (isGenericResponse(response)) {
          setError(new Error(response.message));
          toast.error(response.message);
          setMarkets([]);
        } else {
          setMarkets(response);
          setError(null);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to fetch Polymarket markets: ${error.message}`);
        setMarkets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return { markets, isLoading, error };
}
