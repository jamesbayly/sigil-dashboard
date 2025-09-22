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
import type { SymbolResponse } from "@/types";

export default function SymbolsView() {
  const navigate = useNavigate();
  const { symbolsWithDates } = useSymbols(true);
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

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const columns: ColumnDef<SymbolResponse>[] = [
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
          <span
            className={
              row.original.day_change_percent >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          >
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
          <span
            className={
              row.original.hour_change_percent >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          >
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
    {
      accessorKey: "earliest_date",
      header: "Date Range",
      cell: ({ row }) => {
        return (
          <div className="text-xs">
            <div>From: {formatDate(row.original.earliest_date)}</div>
            <div>To: {formatDate(row.original.latest_date)}</div>
          </div>
        );
      },
    },
  ];

  const handleCreateSymbol = () => {
    navigate("/symbols/create");
  };

  const handleEditSymbol = (symbol: SymbolResponse) => {
    navigate(`/symbols/${symbol.id}`);
  };

  // Filter symbols based on type and search query
  const filteredSymbols = symbolsWithDates.filter((symbol) => {
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
          Showing {filteredSymbols.length} of {symbolsWithDates.length} symbols
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
