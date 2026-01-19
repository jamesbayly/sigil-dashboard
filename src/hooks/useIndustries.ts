import { useEffect, useState } from "react";
import { getIndustries } from "@/utils/api";
import { isGenericResponse, type IndustryTags } from "@/types";

export const useIndustries = () => {
  const [industries, setIndustries] = useState<IndustryTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIndustries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getIndustries();
        if (isGenericResponse(result)) {
          setError(new Error(result.message));
          setIndustries([]);
        } else {
          setIndustries(result);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch industries"),
        );
        setIndustries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  return { industries, isLoading, error };
};
