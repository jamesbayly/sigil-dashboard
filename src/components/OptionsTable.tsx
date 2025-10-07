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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { ArrowUpDown, Upload } from "lucide-react";
import OptionsUploadModal from "./OptionsUploadModal";
import type { OptionsDataResponse } from "@/types";
import { getNumberStyling } from "@/lib/utils";
import SymbolPopover from "./SymbolPopover";

interface OptionsTableProps {
  title?: string;
  showUploadButton?: boolean;
  globalSymbolFilter?: number;
  showFilters?: boolean;
}

export default function OptionsTable({
  title = "Options Data",
  showUploadButton = false,
  globalSymbolFilter,
  showFilters = true,
}: OptionsTableProps) {
  const { optionsData, isLoading, error, isCreating, createOptions } =
    useOptionsData();
  const { symbols } = useSymbols();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [symbolFilter, setSymbolFilter] = useState<string>("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const formatCurrency = (num: number | undefined, showZeros = true) => {
    if (num === undefined || num === null) return "N/A";
    return `$${num.toLocaleString("en-US", {
      minimumFractionDigits: showZeros ? 2 : 0,
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
    // Only show symbol column if not filtered to a specific symbol
    ...(globalSymbolFilter
      ? []
      : ([
          {
            accessorKey: "symbol_id" as const,
            header: ({ column }) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  Symbol
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              );
            },
            cell: ({ row }) => {
              const sym = symbols.find((s) => s.id === row.original.symbol_id);
              return (
                <SymbolPopover symbolId={row.original.symbol_id} symbol={sym} />
              );
            },
          },
        ] as ColumnDef<OptionsDataResponse>[])),
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
      accessorKey: "score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className={getNumberStyling(row.original.score, 20)}>
          {(row.original.score || 0).toFixed(2)}
        </span>
      ),
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
          <span className={getNumberStyling(row.original.strike_delta_percent)}>
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
        return formatCurrency(row.original.premium, false);
      },
    },
  ];

  // Filter options based on type, symbol, and global symbol filter
  const filteredOptions = optionsData.filter((option) => {
    const typeMatch = typeFilter === "ALL" || option.type === typeFilter;
    const symbolMatch =
      symbolFilter === "ALL" || option.symbol_id.toString() === symbolFilter;
    const globalSymbolMatch =
      !globalSymbolFilter || option.symbol_id === globalSymbolFilter;
    return typeMatch && symbolMatch && globalSymbolMatch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading options data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error: {error.message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            {showUploadButton && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Options Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No options data available for this symbol.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {showUploadButton && (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Options Data
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showFilters && !globalSymbolFilter && (
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
                    .sort((a, b) => a.symbol.localeCompare(b.symbol))
                    .map((symbol) => (
                      <SelectItem key={symbol.id} value={symbol.id.toString()}>
                        {symbol.symbol} - {symbol.name.slice(0, 30)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {showFilters && globalSymbolFilter && (
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
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          Showing {filteredOptions.length} of {optionsData.length} options
        </div>

        <div className="overflow-auto">
          <DataTable data={filteredOptions} columns={columns} />
        </div>

        {showUploadButton && (
          <OptionsUploadModal
            open={showUploadModal}
            onOpenChange={setShowUploadModal}
            createOptions={createOptions}
            isCreating={isCreating}
          />
        )}
      </CardContent>
    </Card>
  );
}
