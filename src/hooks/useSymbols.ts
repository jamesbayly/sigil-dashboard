import { useEffect, useState } from "react";
import { getSymbols } from "@/utils/api";
import type { Symbols } from "@/types";

export function useSymbols() {
  const [symbols, setSymbols] = useState<Symbols[]>([]);

  const fetchAll = async () => {
    setSymbols(await getSymbols());
  };
  useEffect(() => {
    fetchAll();
  }, []);

  return { symbols };
}
