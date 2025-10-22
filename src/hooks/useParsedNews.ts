import { useEffect, useState } from "react";
import { getNewsParsed } from "@/utils/api";
import {
  isGenericResponse,
  type NewsParsedResponse,
  type NewsType,
} from "@/types";

export const useParsedNews = (symbolId?: number, type?: NewsType) => {
  const [parsedNews, setParsedNews] = useState<NewsParsedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParsedNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getNewsParsed(symbolId, type);
        if (isGenericResponse(result)) {
          setError(result.message);
          setParsedNews([]);
        } else {
          setParsedNews(result);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch parsed news"
        );
        setParsedNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParsedNews();
  }, [symbolId, type]);

  return { parsedNews, isLoading, error };
};
