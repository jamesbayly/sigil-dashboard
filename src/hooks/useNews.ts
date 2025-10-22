import { useState, useEffect } from "react";
import { getNews } from "@/utils/api";
import { NewsResponse, NewsType, isGenericResponse } from "@/types";
import { toast } from "sonner";

export function useNews(symbolId?: number, type?: NewsType) {
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await getNews(symbolId, type);

        if (isGenericResponse(response)) {
          setError(new Error(response.message));
          toast.error(response.message);
          setNews([]);
        } else {
          setNews(response);
          setError(null);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to fetch news: ${error.message}`);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [symbolId, type]);

  return { news, isLoading, error };
}
