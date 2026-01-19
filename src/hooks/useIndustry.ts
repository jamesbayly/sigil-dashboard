import { useState, useEffect, useCallback } from "react";
import { getIndustry } from "@/utils/api";
import { IndustryTagResponse, isGenericResponse } from "@/types";
import { toast } from "sonner";

export function useIndustry(id?: number) {
  const [industry, setIndustry] = useState<IndustryTagResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIndustry = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const result = await getIndustry(id);

      if (isGenericResponse(result)) {
        setError(new Error(result.message));
        toast.error(result.message);
        setIndustry(null);
      } else {
        setIndustry(result);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch industry: ${error.message}`);
      setIndustry(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIndustry();
  }, [fetchIndustry]);

  return { industry, isLoading, error };
}
