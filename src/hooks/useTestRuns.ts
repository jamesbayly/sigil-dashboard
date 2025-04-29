import { useEffect, useState } from "react";
import { getTestRuns } from "@/utils/api";
import { isGenericResponse, type StrategyTestRunsResponse } from "@/types";
import { toast } from "sonner";

export const useTestRuns = () => {
  const [testRuns, setTestRuns] = useState<StrategyTestRunsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getTestRuns();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setTestRuns(res);
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch test runs");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { testRuns, isLoading, error, refetch: fetchAll };
};
