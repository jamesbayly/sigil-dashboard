import { useState } from "react";
import { useOptionsData } from "@/hooks/useOptionsData";
import { useSymbols } from "@/hooks/useSymbols";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { ArrowUpDown } from "lucide-react";
import type { OptionsDataResponse } from "@/types";

export default function OptionsView() {
  const { optionsData, isLoading, error } = useOptionsData();
  const { symbols } = useSymbols(false);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [symbolFilter, setSymbolFilter] = useState<string>("ALL");

  const formatCurrency = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return `$${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatPercentage = (num: number) => {
    if (num === undefined || num === null) return "N/A";
    return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const getOptionTypeColor = (type: string) => {
    switch (type) {
      case "CALL_BUY":
        return "bg-green-50 text-green-700 dark:bg-green-800 dark:text-green-300";
      case "CALL_SELL":
        return "bg-red-50 text-red-700 dark:bg-red-800 dark:text-red-300";
      case "PUT_BUY":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PUT_SELL":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getSymbolName = (symbolId: number) => {
    const symbol = symbols.find((s) => s.id === symbolId);
    return symbol ? `${symbol.name} (${symbol.symbol})` : `ID: ${symbolId}`;
  };

  const columns: ColumnDef<OptionsDataResponse>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "symbol_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Symbol
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="font-medium">
            {getSymbolName(row.original.symbol_id)}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <Badge
            className={getOptionTypeColor(row.original.type)}
            variant="outline"
          >
            {row.original.type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "trade_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Trade Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return formatDate(row.original.trade_date);
      },
    },
    {
      accessorKey: "expiration_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Expiration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return formatDate(row.original.expiration_date);
      },
    },
    {
      accessorKey: "asset_price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Asset Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return formatCurrency(row.original.asset_price);
      },
    },
    {
      accessorKey: "strike_price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Strike Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return formatCurrency(row.original.strike_price);
      },
    },
    {
      accessorKey: "strike_delta_percent",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Strike Delta
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span
            className={
              row.original.strike_delta_percent >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {formatPercentage(row.original.strike_delta_percent)}
          </span>
        );
      },
    },
    {
      accessorKey: "premium",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Premium
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return formatCurrency(row.original.premium);
      },
    },
  ];

  // Filter options based on type and symbol
  const filteredOptions = optionsData.filter((option) => {
    const typeMatch = typeFilter === "ALL" || option.type === typeFilter;
    const symbolMatch =
      symbolFilter === "ALL" || option.symbol_id.toString() === symbolFilter;
    return typeMatch && symbolMatch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Options Data</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading options data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Options Data</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Options Data</h2>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by Type:</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CALL_BUY">Call Buy</SelectItem>
              <SelectItem value="CALL_SELL">Call Sell</SelectItem>
              <SelectItem value="PUT_BUY">Put Buy</SelectItem>
              <SelectItem value="PUT_SELL">Put Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by Symbol:</span>
          <Select value={symbolFilter} onValueChange={setSymbolFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Symbols" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Symbols</SelectItem>
              {symbols
                .filter((s) => s.symbol_type === "STOCK")
                .map((symbol) => (
                  <SelectItem key={symbol.id} value={symbol.id.toString()}>
                    {symbol.name} ({symbol.symbol})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredOptions.length} of {optionsData.length} options
        </div>
      </div>

      <div className="overflow-auto">
        <DataTable data={filteredOptions} columns={columns} />
      </div>
    </div>
  );
}
