import { useEffect, useState } from "react";
import { getOptionsData, createOptionsData } from "@/utils/api";
import {
  isGenericResponse,
  type OptionsDataResponse,
  type OptionsDataRequest,
} from "@/types";
import { toast } from "sonner";

export const useOptionsData = (symbolId?: number) => {
  const [optionsData, setOptionsData] = useState<OptionsDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getOptionsData(symbolId);
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

  const createOptions = async (optionsData: OptionsDataRequest[]) => {
    try {
      setIsCreating(true);
      setError(null);

      const res = await createOptionsData(optionsData);
      if (isGenericResponse(res)) {
        if (res.message.toLowerCase().includes("success")) {
          toast.success(res.message);
          // Refresh the data after successful creation
          await fetchAll();
          return { success: true, message: res.message };
        } else {
          throw new Error(res.message);
        }
      }

      return { success: true, message: "Options data created successfully" };
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to create options data");
      setError(newError);
      toast.error(newError.message);
      return { success: false, message: newError.message };
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolId]);

  return {
    optionsData,
    isLoading,
    error,
    isCreating,
    refetch: fetchAll,
    createOptions,
  };
};
