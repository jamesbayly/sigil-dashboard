import { useEffect, useState } from "react";
import { createSymbol, getSymbol, updateSymbol } from "@/utils/api";
import {
  isGenericResponse,
  type SymbolRequest,
  type SymbolResponse,
} from "@/types";
import { toast } from "sonner";

export const useSymbol = (id?: number) => {
  const [symbol, setSymbol] = useState<SymbolResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSymbol = async (symbolId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getSymbol(symbolId);
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }

      setSymbol(res as SymbolResponse);
    } catch (err) {
      const newError =
        err instanceof Error ? err : new Error("Failed to fetch symbol");
      setError(newError);
      toast.error(newError.message);
      setSymbol(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSymbol(id);
    }
  }, [id]);

  const create = async (
    data: SymbolRequest
  ): Promise<SymbolResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await createSymbol(data);
      if (isGenericResponse(res)) {
        toast.error(res.message);
        return null;
      }

      toast.success("Symbol created successfully");
      const createdSymbol = res as SymbolResponse;
      setSymbol(createdSymbol);
      return createdSymbol;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to create symbol";
      toast.error(error);
      setError(new Error(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (
    data: SymbolRequest & {
      id: number;
    }
  ): Promise<SymbolResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await updateSymbol(data);
      if (isGenericResponse(res)) {
        toast.error(res.message);
        return null;
      }

      toast.success("Symbol updated successfully");
      const updatedSymbol = res as SymbolResponse;
      setSymbol(updatedSymbol);
      return updatedSymbol;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to update symbol";
      toast.error(error);
      setError(new Error(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (id) {
      fetchSymbol(id);
    }
  };

  return {
    symbol,
    create,
    update,
    isLoading,
    error,
    refetch,
  };
};
