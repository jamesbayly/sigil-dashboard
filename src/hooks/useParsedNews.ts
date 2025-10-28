import { useEffect, useState } from "react";
import { getNewsParsed } from "@/utils/api";
import {
  isGenericResponse,
  type NewsParsedResponse,
  type NewsType,
} from "@/types";

export const useParsedNews = (
  symbolId?: number,
  type?: NewsType,
  industry_ids?: number[]
) => {
  const [parsedNews, setParsedNews] = useState<NewsParsedResponse[]>([]);
  const [relatedIndustryNews, setRelatedIndustryNews] = useState<
    NewsParsedResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParsedNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getNewsParsed(symbolId, type, industry_ids);
        if (isGenericResponse(result)) {
          setError(result.message);
          setParsedNews([]);
        } else {
          setParsedNews(result.asset_news);
          setRelatedIndustryNews(result.related_industry_news);
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
  }, [symbolId, type, industry_ids]);

  return { parsedNews, relatedIndustryNews, isLoading, error };
};
