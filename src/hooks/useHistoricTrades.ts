import { useEffect, useState } from "react";
import { getHistoricTrades } from "@/utils/api";
import { type Trades, isGenericResponse } from "@/types";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

export const useHistoricTrades = (
  date: DateRange | undefined,
  strategyId?: number,
  symbolId?: number
) => {
  const [trades, setTrades] = useState<Trades[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getHistoricTrades(
        date?.from,
        date?.to,
        strategyId,
        symbolId
      );
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setTrades(res);
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
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, strategyId, symbolId]); // Add dependencies here

  return { trades, isLoading, error };
};
