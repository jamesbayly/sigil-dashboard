import { useState } from "react";
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
import type { SymbolResponse, SymbolRequest } from "@/types";
import SymbolModal from "./SymbolModal";

export default function SymbolsView() {
  const { symbolsWithDates, add, edit } = useSymbols(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolResponse | null>(
    null
  );
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

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
    setSelectedSymbol(null);
    setIsModalOpen(true);
  };

  const handleEditSymbol = (symbol: SymbolResponse) => {
    setSelectedSymbol(symbol);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSymbol(null);
  };

  const handleSaveSymbol = async (symbolData: SymbolRequest) => {
    try {
      if (selectedSymbol) {
        // Edit existing symbol - merge with existing data to maintain all required fields
        const updatedSymbol: SymbolResponse = {
          ...selectedSymbol,
          ...symbolData,
        };
        await edit(updatedSymbol);
      } else {
        // Create new symbol
        await add(symbolData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save symbol:", error);
    }
  };

  // Filter symbols based on type
  const filteredSymbols = symbolsWithDates.filter((symbol) => {
    if (typeFilter === "ALL") return true;
    return symbol.symbol_type === typeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Symbols</h2>
        <Button onClick={handleCreateSymbol}>Create Symbol</Button>
      </div>

      <div className="flex gap-4 items-center">
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

      <SymbolModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSymbol}
        symbol={selectedSymbol}
      />
    </div>
  );
}
