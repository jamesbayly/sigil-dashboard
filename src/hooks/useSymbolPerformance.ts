import { useEffect, useState } from "react";
import { getSymbolPerformance } from "@/utils/api";
import { isGenericResponse, type SymbolPerformanceResponse } from "@/types";
import { toast } from "sonner";

export const useSymbolPerformance = (symbolId?: number) => {
  const [performance, setPerformance] =
    useState<SymbolPerformanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPerformance = async (targetSymbolId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getSymbolPerformance(targetSymbolId);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setPerformance(res as SymbolPerformanceResponse);
    } catch (err) {
      const newError =
        err instanceof Error
          ? err
          : new Error("Failed to fetch symbol performance");
      setError(newError);
      setPerformance(null);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!symbolId) {
      setPerformance(null);
      return;
    }

    fetchPerformance(symbolId);
  }, [symbolId]);

  const refetch = () => {
    if (symbolId) {
      fetchPerformance(symbolId);
    }
  };

  return {
    performance,
    isLoading,
    error,
    refetch,
  };
};
