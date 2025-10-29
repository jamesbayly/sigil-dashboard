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
import { ArrowUpDown, Upload, Sparkles } from "lucide-react";
import OptionsUploadModal from "./OptionsUploadModal";
import type { OptionsDataResponse } from "@/types";
import { getNumberStyling } from "@/lib/utils";
import SymbolPopover from "./SymbolPopover";
import SymbolSelector from "./SymbolSelector";
import { runAIDailyStockStrategy } from "@/utils/api";
import { toast } from "sonner";

interface OptionsTableProps {
  title?: string;
  showActions?: boolean;
  globalSymbolFilter?: number;
  showFilters?: boolean;
}

export default function OptionsTable({
  title = "Options Data",
  showActions = false,
  globalSymbolFilter,
  showFilters = true,
}: OptionsTableProps) {
  const { symbols } = useSymbols();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isRunningAI, setIsRunningAI] = useState(false);

  const { optionsData, isLoading, error, isCreating, createOptions } =
    useOptionsData(globalSymbolFilter);

  const handleRunAIStrategy = async () => {
    setIsRunningAI(true);
    try {
      const result = await runAIDailyStockStrategy();
      if ("message" in result) {
        toast.success(
          result.message || "AI daily stock strategy completed successfully!"
        );
      } else {
        toast.success("AI daily stock strategy completed!");
      }
    } catch (error) {
      toast.error("An error occurred while running the AI strategy");
      console.error("AI Strategy error:", error);
    } finally {
      setIsRunningAI(false);
    }
  };

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
      symbolFilter === undefined || option.symbol_id === symbolFilter;
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle>{title}</CardTitle>
            {showActions && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload Options Data
                </Button>
                <Button
                  onClick={handleRunAIStrategy}
                  disabled={isRunningAI}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4" />
                  {isRunningAI ? "Running..." : "Run AI Strategy"}
                </Button>
              </div>
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle>{title}</CardTitle>
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Upload className="h-4 w-4" />
                Upload Options Data
              </Button>
              <Button
                onClick={handleRunAIStrategy}
                disabled={isRunningAI}
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
                variant="outline"
              >
                <Sparkles className="h-4 w-4" />
                {isRunningAI ? "Running..." : "Run AI Strategy"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showFilters && !globalSymbolFilter && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Filter by Type:
              </span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Filter by Symbol:
              </span>
              <SymbolSelector
                value={symbolFilter}
                onChange={setSymbolFilter}
                showLabel={false}
                className="w-full sm:w-[200px]"
                filterType="STOCK"
                showName={true}
              />
            </div>
          </div>
        )}

        {showFilters && globalSymbolFilter && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Filter by Type:
              </span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
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

        <div>
          <DataTable data={filteredOptions} columns={columns} />
        </div>

        {showActions && (
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
