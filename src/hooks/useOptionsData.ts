import { useEffect, useState } from "react";
import { getOptionsData } from "@/utils/api";
import { isGenericResponse, type OptionsDataResponse } from "@/types";
import { toast } from "sonner";

export const useOptionsData = () => {
  const [optionsData, setOptionsData] = useState<OptionsDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getOptionsData();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setOptionsData(res);
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch options data");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { optionsData, isLoading, error, refetch: fetchAll };
};
