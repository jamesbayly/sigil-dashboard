import { useEffect, useState } from "react";
import { getTestRuns } from "@/utils/api";
import type { StrategyTestRunsResponse } from "@/types";

export function useTestRuns() {
  const [testRuns, setTestRuns] = useState<StrategyTestRunsResponse[]>([]);

  const fetchAll = async () => {
    setTestRuns(await getTestRuns());
  };
  useEffect(() => {
    fetchAll();
  }, []);

  return { testRuns };
}
