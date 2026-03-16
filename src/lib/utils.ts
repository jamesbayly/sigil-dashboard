import { BinanceTrades, PolymarketTrades, Trades } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function returns tailwind styling for a given number based on the input number and the median value.
// It returns a darker green for values far above the median, a lighter green for values slightly above the median,
export const getNumberStyling = (
  number: number | undefined,
  median: number = 0,
) => {
  if (number === undefined) return "text-gray-600";

  if (number > median) return "text-green-600";
  if (number < median) return "text-red-600";
  return "text-grey-600";
};

export const exportCSV = (
  fileName: string,
  header: string,
  data: unknown[][],
) => {
  // Helper to escape CSV values
  const escapeCSVValue = (value: unknown) => {
    let str = String(value ?? "");
    // Escape double quotes by doubling them
    str = str.replace(/"/g, '""');
    // If value contains comma, quote, or newline, wrap in quotes
    if (/[,"\n\r]/.test(str)) {
      str = `"${str}"`;
    }
    // Remove control chars except tab/newline
    // eslint-disable-next-line no-control-regex
    str = str.replace(/[\x00-\x1F\x7F]/g, (c) =>
      c === "\t" || c === "\n" || c === "\r" ? c : "",
    );
    return str;
  };

  const csvRows = data.map((row) => row.map(escapeCSVValue).join(","));
  const csvContent =
    `data:text/csv;charset=utf-8,${header}\n` + csvRows.join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
};

export const isRealTrade = (
  trade: Trades | BinanceTrades | PolymarketTrades,
) => {
  return "open_binance_order_id" in trade && trade.open_binance_order_id;
};
