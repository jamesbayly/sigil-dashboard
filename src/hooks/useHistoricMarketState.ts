import { useEffect, useState } from "react";
import { getHistoricMarketState } from "@/utils/api";
import { MarketState, isGenericResponse } from "@/types";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

export const useHistoricMarketState = (date: DateRange | undefined) => {
  const [marketState, setMarketState] = useState<MarketState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getHistoricMarketState(date?.from, date?.to);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setMarketState(res);
    } catch (err) {
      const newError =
        err instanceof Error
          ? err
          : new Error("Failed to fetch historic market state");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]); // Add dependencies here

  return { marketState, isLoading, error };
};
