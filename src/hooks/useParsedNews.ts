import { useEffect, useState } from "react";
import { getNewsParsed } from "@/utils/api";
import {
  isGenericResponse,
  type NewsParsedResponse,
  type NewsType,
  type PaginationMeta,
} from "@/types";

export const useParsedNews = (
  symbolId?: number,
  type?: NewsType,
  industry_ids?: number[],
) => {
  const [parsedNews, setParsedNews] = useState<NewsParsedResponse[]>([]);
  const [relatedIndustryNews, setRelatedIndustryNews] = useState<
    NewsParsedResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState<string | undefined>();
  const [assetNewsPagination, setAssetNewsPagination] = useState<
    PaginationMeta | undefined
  >();
  const [relatedNewsPagination, setRelatedNewsPagination] = useState<
    PaginationMeta | undefined
  >();

  useEffect(() => {
    const fetchParsedNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getNewsParsed(
          symbolId,
          type,
          industry_ids,
          page,
          limit,
          search,
        );
        if (isGenericResponse(result)) {
          setError(result.message);
          setParsedNews([]);
        } else {
          setParsedNews(result.asset_news.data);
          setRelatedIndustryNews(result.related_industry_news.data);
          setAssetNewsPagination(result.asset_news.pagination);
          setRelatedNewsPagination(result.related_industry_news.pagination);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch parsed news",
        );
        setParsedNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParsedNews();
  }, [symbolId, type, industry_ids, page, limit, search]);

  return {
    parsedNews,
    relatedIndustryNews,
    isLoading,
    error,
    assetNewsPagination,
    relatedNewsPagination,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
  };
};
