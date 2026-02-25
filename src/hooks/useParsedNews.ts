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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState<string | undefined>();
  const [assetNewsPagination, setAssetNewsPagination] = useState<
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
        } else if (result && typeof result === "object") {
          // Check if it has the expected nested structure
          if (result.data) {
            setParsedNews(result.data || []);
            setAssetNewsPagination(result.pagination);
          } else if (Array.isArray(result)) {
            // If it's just an array, treat it as parsed news
            console.log("Received array response, treating as parsed news");
            setParsedNews(result);
          } else {
            console.error("Unexpected response format:", result);
            console.error(
              "Expected structure with asset_news and related_industry_news",
            );
            setError(
              `Unexpected response format from API. Keys found: ${Object.keys(result).join(", ")}`,
            );
            setParsedNews([]);
          }
        } else {
          console.error("Response is not an object:", result);
          setError("Invalid response from API");
          setParsedNews([]);
        }
      } catch (err) {
        console.error("Error fetching parsed news:", err);
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
    isLoading,
    error,
    assetNewsPagination,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
  };
};
