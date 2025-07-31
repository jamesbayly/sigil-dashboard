import { useEffect, useState } from "react";
import { createSymbol, getSymbols, updateSymbol } from "@/utils/api";
import {
  isGenericResponse,
  type SymbolRequest,
  type SymbolResponse,
} from "@/types";
import { toast } from "sonner";

export const useSymbols = (with_dates: boolean) => {
  const [symbols, setSymbols] = useState<SymbolResponse[]>([]);
  const [symbolsWithDates, setSymbolsWithDates] = useState<SymbolResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async (include_dates: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getSymbols(include_dates);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      if (include_dates) {
        setSymbolsWithDates(res as SymbolResponse[]);
      } else {
        setSymbols(res as SymbolResponse[]);
      }
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch symbols");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(with_dates);
  }, [with_dates]);

  const add = async (data: SymbolRequest) => {
    await createSymbol(data);
    fetchAll(with_dates);
  };
  const edit = async (data: SymbolResponse) => {
    await updateSymbol(data);
    fetchAll(with_dates);
  };

  return {
    symbols,
    symbolsWithDates,
    add,
    edit,
    isLoading,
    error,
    refetch: fetchAll,
  };
};
