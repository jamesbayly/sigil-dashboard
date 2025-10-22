import { useEffect, useState } from "react";
import { getStrategies, createStrategy, updateStrategy } from "@/utils/api";
import {
  isGenericResponse,
  StrategyRequest,
  type StrategyResponse,
} from "@/types";
import { toast } from "sonner";

export const useStrategies = () => {
  const [strategies, setStrategies] = useState<StrategyResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getStrategies();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setStrategies(res);
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch test run");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const add = async (data: StrategyRequest) => {
    await createStrategy(data);
    fetchAll();
  };
  const edit = async (data: StrategyResponse) => {
    await updateStrategy(data);
    fetchAll();
  };
  return { strategies, add, edit, isLoading, error, refetch: fetchAll };
};
