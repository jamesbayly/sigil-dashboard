import { useEffect, useState } from "react";
import { getTestRuns } from "@/utils/api";
import {
  isGenericResponse,
  type StrategyTestRunsResponse,
  type PaginationMeta,
} from "@/types";
import { toast } from "sonner";

export const useTestRuns = () => {
  const [testRuns, setTestRuns] = useState<StrategyTestRunsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getTestRuns(page, limit);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setTestRuns(res.data);
      setPagination(res.pagination);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return {
    testRuns,
    isLoading,
    error,
    refetch: fetchAll,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
  };
};
