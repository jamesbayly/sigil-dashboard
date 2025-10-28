import { useState } from "react";
import { useNews } from "@/hooks/useNews";
import { useSymbols } from "@/hooks/useSymbols";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NewsResponse, NewsType } from "@/types";
import { Badge } from "./ui/badge";
import SymbolPopover from "./SymbolPopover";

export default function NewsList() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<NewsType | undefined>();
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>();
  const { news, isLoading, error } = useNews(symbolFilter, typeFilter);
  const { symbols } = useSymbols();

  const columns: ColumnDef<NewsResponse>[] = [
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
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.original.date).toLocaleDateString();
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        const color =
          type === "PREMARKET"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        return (
          <Badge className={color} variant="outline">
            {type === "PREMARKET" ? "Premarket" : "Intraday Options"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "symbol_id",
      header: "Symbol",
      cell: ({ row }) => {
        const symbolId = row.original.symbol_id;
        if (!symbolId) return <span className="text-muted-foreground">-</span>;
        const sym = symbols.find((s) => s.id === symbolId);
        return <SymbolPopover symbolId={symbolId} symbol={sym} />;
      },
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        const content = row.original.content;
        return (
          <div className="max-w-md truncate" title={content}>
            {content}
          </div>
        );
      },
    },
    {
      accessorKey: "parsed_items",
      header: "Parsed Items",
      cell: ({ row }) => {
        return row.original.parsed_items?.length || 0;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">News</h2>
        <Button
          onClick={() => navigate("/news/create")}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create News
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="w-full sm:w-auto">
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) =>
                  setTypeFilter(v === "ALL" ? undefined : (v as NewsType))
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="PREMARKET">Premarket</SelectItem>
                  <SelectItem value="GENERAL_NEWS">General News</SelectItem>
                  <SelectItem value="NOTABLE_OPTIONS">
                    Notable Options
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Label>Symbol</Label>
              <Select
                value={symbolFilter?.toString()}
                onValueChange={(v) =>
                  setSymbolFilter(v === "ALL" ? undefined : Number(v))
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Symbols" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Symbols</SelectItem>
                  {symbols
                    .sort((a, b) => a.symbol.localeCompare(b.symbol))
                    .map((symbol) => (
                      <SelectItem key={symbol.id} value={symbol.id.toString()}>
                        {symbol.symbol}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && <div className="text-center py-8">Loading news...</div>}
          {error && (
            <div className="text-center py-8 text-red-600">
              Error: {error.message}
            </div>
          )}
          {!isLoading && !error && (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {news.length} news item{news.length !== 1 ? "s" : ""}
              </div>
              <DataTable
                data={news}
                columns={columns}
                onRowClick={(row) => navigate(`/news/${row.id}`)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
