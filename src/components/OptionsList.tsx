import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { ArrowUpDown } from "lucide-react";
import type { OptionsDataResponse } from "@/types";
import { OptionType } from "@/types";
import { useOptionsData } from "@/hooks/useOptionsData";
import { useSymbols } from "@/hooks/useSymbols";
import { getNumberStyling } from "@/lib/utils";
import SymbolPopover from "./SymbolPopover";
import SymbolSelector from "./SymbolSelector";
import { PaginationControls } from "./ui/pagination-controls";

interface OptionsListProps {
  symbolId?: number;
}

const TYPE_LABELS: Record<OptionType, string> = {
  CALL_BUY: "Call Buy",
  CALL_SELL: "Call Sell",
  PUT_BUY: "Put Buy",
  PUT_SELL: "Put Sell",
};

export default function OptionsList({
  symbolId: initialSymbolId,
}: OptionsListProps) {
  const [typeFilter, setTypeFilter] = useState<OptionType[]>([]);
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>(
    initialSymbolId,
  );
  const { symbols } = useSymbols();

  // Use initialSymbolId if provided, otherwise use the state
  const symbolId = initialSymbolId ?? symbolFilter;

  // Convert type filter to API format
  const typesFilter = useMemo(() => {
    return typeFilter.length === 0 ? undefined : typeFilter;
  }, [typeFilter]);

  const { optionsData, isLoading, error, pagination, setPage, setLimit } =
    useOptionsData(symbolId, typesFilter);

  const toggleTypeFilter = (type: OptionType) => {
    setTypeFilter((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
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
    ...(initialSymbolId
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
        <span className={getNumberStyling(row.original.score, 10)}>
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
        const exp = row.original.expiration_date;
        const isExpired = exp ? new Date(exp) < new Date() : false;
        return (
          <span
            className={
              isExpired ? "text-red-700 dark:text-red-300 font-semibold" : ""
            }
          >
            {formatDate(exp)}
          </span>
        );
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Filter by Type:</span>
            <div className="flex flex-wrap gap-2">
              {Object.values(OptionType).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTypeFilter(type)}
                >
                  {TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>
          {!initialSymbolId && (
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
          )}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading options data...</div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-red-600">Error: {error.message}</div>
            </div>
          </CardContent>
        </Card>
      ) : optionsData.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No options data available.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <DataTable data={optionsData} columns={columns} />
            {pagination && (
              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
