import { useEffect, useState } from "react";
import { getSymbols } from "@/utils/api";
import { isGenericResponse, type Symbols } from "@/types";
import { toast } from "sonner";

export const useSymbols = () => {
  const [symbols, setSymbols] = useState<Symbols[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getSymbols();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setSymbols(res);
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
    fetchAll();
  }, []);

  return { symbols, isLoading, error, refetch: fetchAll };
};
