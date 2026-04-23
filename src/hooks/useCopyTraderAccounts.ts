import { useEffect, useState } from "react";
import {
  getCopyTraderAccounts,
  createCopyTraderAccount,
  updateCopyTraderAccount,
  deleteCopyTraderAccount,
} from "@/utils/api";
import {
  isGenericResponse,
  type CopyTraderAccountRequest,
  type CopyTraderAccountUpdateRequest,
  type CopyTraderAccountDetailResponse,
} from "@/types";
import { toast } from "sonner";

export const useCopyTraderAccounts = () => {
  const [accounts, setAccounts] = useState<CopyTraderAccountDetailResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getCopyTraderAccounts();
      if (isGenericResponse(res)) {
        throw new Error(res.message);
      }
      setAccounts(res);
    } catch (err) {
      const newError =
        err instanceof Error
          ? err
          : new Error("Failed to fetch copy trader accounts");
      setError(newError);
      toast.error(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const add = async (data: CopyTraderAccountRequest) => {
    const res = await createCopyTraderAccount(data);
    if (isGenericResponse(res)) {
      throw new Error(res.message);
    }
    await fetchAll();
  };

  const edit = async (id: number, data: CopyTraderAccountUpdateRequest) => {
    const res = await updateCopyTraderAccount(id, data);
    if (isGenericResponse(res)) {
      throw new Error(res.message);
    }
    await fetchAll();
  };

  const remove = async (id: number) => {
    const res = await deleteCopyTraderAccount(id);
    if (!isGenericResponse(res)) {
      throw new Error("Unexpected response");
    }
    await fetchAll();
  };

  return { accounts, isLoading, error, add, edit, remove, refetch: fetchAll };
};
