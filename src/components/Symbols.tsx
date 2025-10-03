import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSymbols } from "@/hooks/useSymbols";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { ArrowUpDown, Search } from "lucide-react";
import type { SymbolsResponse } from "@/types";
import { getNumberStyling } from "@/lib/utils";

export default function SymbolsView() {
  const navigate = useNavigate();
  const { symbols } = useSymbols();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    if (num === undefined || num === null) return "N/A";
    return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const columns: ColumnDef<SymbolsResponse>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.name}</span>;
      },
    },
    {
      accessorKey: "symbol_type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <Badge
            variant={
              row.original.symbol_type === "CRYPTO" ? "default" : "secondary"
            }
          >
            {row.original.symbol_type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "symbol",
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
        return <span className="font-mono text-sm">{row.original.symbol}</span>;
      },
    },
    {
      accessorKey: "option_score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Option Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return row.original.symbol_type === "STOCK" ? (
          <>
            <span className={getNumberStyling(row.original.option_score)}>
              {row.original.option_score.toFixed(3)}
            </span>{" "}
            <span
              className={getNumberStyling(
                row.original.option_score - row.original.option_score_prev
              )}
            >
              (Δ{" "}
              {(
                row.original.option_score - row.original.option_score_prev
              ).toFixed(3)}
              )
            </span>
          </>
        ) : (
          "N/A"
        );
      },
    },
    {
      accessorKey: "market_cap",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Market Cap (M)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return formatNumber(row.original.market_cap);
      },
    },
    {
      accessorKey: "day_change_percent",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            24h Change
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className={getNumberStyling(row.original.day_change_percent)}>
            {formatPercentage(row.original.day_change_percent)}
          </span>
        );
      },
    },
    {
      accessorKey: "hour_change_percent",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            1h Change
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className={getNumberStyling(row.original.hour_change_percent)}>
            {formatPercentage(row.original.hour_change_percent)}
          </span>
        );
      },
    },
    {
      accessorKey: "cg_rank",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            CG Rank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return row.original.cg_rank || "N/A";
      },
    },
  ];

  const handleCreateSymbol = () => {
    navigate("/symbols/create");
  };

  const handleEditSymbol = (symbol: SymbolsResponse) => {
    navigate(`/symbols/${symbol.id}`);
  };

  // Filter symbols based on type and search query
  const filteredSymbols = symbols.filter((symbol) => {
    const matchesType =
      typeFilter === "ALL" || symbol.symbol_type === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      symbol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      symbol.id.toString().includes(searchQuery);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Symbols</h2>
        <Button onClick={handleCreateSymbol}>Create Symbol</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[250px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="STOCK">Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredSymbols.length} of {symbols.length} symbols
        </div>
      </div>

      <div className="overflow-auto">
        <DataTable
          data={filteredSymbols}
          columns={columns}
          onRowClick={handleEditSymbol}
        />
      </div>
    </div>
  );
}
