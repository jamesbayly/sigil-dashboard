import { useEffect, useState } from "react";
import { deleteTestRun, getTestRun } from "@/utils/api";
import { isGenericResponse, type StrategyTestRunResponse } from "@/types";
import { toast } from "sonner";

export const useTestRun = (testRunID: number) => {
  const [testRun, setTestRun] = useState<StrategyTestRunResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getTestRun(id);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setTestRun(res);
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
    fetch(testRunID);
  }, [testRunID]);

  const onDelete = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await deleteTestRun(id);
      if (isGenericResponse(res)) {
        toast(res.message);
      }
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to delete test run");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    testRun,
    onDelete,
    isLoading,
    error,
    refetch: () => fetch(testRunID),
  };
};
