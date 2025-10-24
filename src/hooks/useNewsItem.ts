import { useState, useEffect, useCallback } from "react";
import { getNews, createNews, updateNews, deleteNews } from "@/utils/api";
import { NewsResponse, NewsRequest, isGenericResponse } from "@/types";
import { toast } from "sonner";

export function useNewsItem(id?: number) {
  const [newsItem, setNewsItem] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNewsItem = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getNews(id);

      if (isGenericResponse(response)) {
        setError(new Error(response.message));
        toast.error(response.message);
        setNewsItem(null);
      } else {
        setNewsItem(response);
        setError(null);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch news item: ${error.message}`);
      setNewsItem(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNewsItem();
  }, [fetchNewsItem]);

  const create = async (data: NewsRequest): Promise<NewsResponse | null> => {
    try {
      const response = await createNews(data);

      if (isGenericResponse(response)) {
        toast.error(response.message);
        return null;
      }

      toast.success("News item created successfully");
      setNewsItem(response);
      // Refetch to get the latest data including parsed items
      await fetchNewsItem();
      return response;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to create news item: ${error.message}`);
      return null;
    }
  };

  const update = async (data: NewsResponse): Promise<NewsResponse | null> => {
    try {
      const response = await updateNews(data);

      if (isGenericResponse(response)) {
        toast.error(response.message);
        return null;
      }

      toast.success("News item updated successfully");
      setNewsItem(response);
      // Refetch to get the latest data including parsed items
      await fetchNewsItem();
      return response;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to update news item: ${error.message}`);
      return null;
    }
  };

  const deleteItem = async (newsId: number): Promise<boolean> => {
    try {
      const response = await deleteNews(newsId);

      if (isGenericResponse(response)) {
        if (response.message.includes("successfully")) {
          toast.success("News item deleted successfully");
          return true;
        }
        toast.error(response.message);
        return false;
      }

      toast.success("News item deleted successfully");
      return true;
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to delete news item: ${error.message}`);
      return false;
    }
  };

  return {
    newsItem,
    create,
    update,
    deleteItem,
    refetch: fetchNewsItem,
    isLoading,
    error,
  };
}
