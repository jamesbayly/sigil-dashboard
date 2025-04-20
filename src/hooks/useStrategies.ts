import { useEffect, useState } from "react";
import { getStrategies, createStrategy, updateStrategy } from "@/utils/api";
import type { Strategy } from "@/types";

export function useStrategies() {
  const [list, setList] = useState<Strategy[]>([]);

  const fetchAll = async () => {
    setList(await getStrategies());
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const add = async (data: Omit<Strategy, "id">) => {
    await createStrategy(data);
    fetchAll();
  };
  const edit = async (id: number, data: Partial<Strategy>) => {
    await updateStrategy(id, data);
    fetchAll();
  };
  return { list, add, edit };
}
