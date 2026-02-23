import { useState, useEffect } from "react";
import { getAllNews } from "@/utils/api";
import {
  NewsResponse,
  NewsType,
  isGenericResponse,
  type PaginationMeta,
} from "@/types";
import { toast } from "sonner";

export function useNews(symbolId?: number, type?: NewsType) {
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [search, setSearch] = useState<string | undefined>();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await getAllNews(symbolId, type, page, limit, search);

        if (isGenericResponse(response)) {
          setError(new Error(response.message));
          toast.error(response.message);
          setNews([]);
        } else {
          setNews(response.data);
          setPagination(response.pagination);
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
  }, [symbolId, type, page, limit, search]);

  return {
    news,
    isLoading,
    error,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
  };
}
