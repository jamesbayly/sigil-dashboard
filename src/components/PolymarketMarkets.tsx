import { useState } from "react";
import { usePolymarketMarkets } from "@/hooks/usePolymarketMarkets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PolymarketMarketsResponse } from "@/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getAllPolymarketTrades } from "@/utils/api";
import { exportCSV } from "@/lib/utils";

export default function PolymarketMarkets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minTradesFilter, setMinTradesFilter] = useState<boolean>(true);
  const [insiderScoreFilter, setInsiderScoreFilter] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const { markets, isLoading, error } = usePolymarketMarkets();

  const filteredMarkets = markets.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (minTradesFilter && m.significant_trades_count <= 1) return false;
    if (insiderScoreFilter && m.insider_trading_score < 0.6) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !m.title.toLowerCase().includes(query) &&
        !m.slug.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const exportAllTrades = async () => {
    // Get date from getAllPolymarketTrades response
    const data = await getAllPolymarketTrades();
    if ("error" in data) {
      alert(`Error fetching trades: ${data.error}`);
      return;
    }

    if (Array.isArray(data)) {
      exportCSV(
        `all_trades`,
        "market_id,market_title,market_slug,market_resolution_date,insider_trading_score,trade_id,transaction_hash,trade_date,user_id,user_name,user_trade_count,side,outcome,amount,price,current_price,current_profit,current_profit_percent",
        data.map((trade) => [
          trade.market_id,
          trade.market_title,
          trade.market_slug,
          trade.market_resolution_date,
          trade.insider_trading_score,
          trade.id,
          trade.transaction_hash,
          trade.trade_date,
          trade.user_id,
          trade.user_name ?? "",
          trade.user_trade_count,
          trade.side,
          trade.outcome,
          trade.amount,
          trade.price,
          trade.current_price ?? "",
          trade.current_profit ?? "",
          trade.current_profit_percent ?? "",
        ]),
      );
    }
  };

  const columns: ColumnDef<PolymarketMarketsResponse>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="max-w-md truncate" title={row.original.title}>
            {row.original.title}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === "active"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : status === "closed"
              ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        return (
          <Badge className={color} variant="outline">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "insider_trading_score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Insider Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const score = row.original.insider_trading_score;
        return (
          <div className="text-center font-mono">
            {score?.toFixed(2) ?? "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "significant_trades_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Significant Trades
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {row.original.significant_trades_count}
          </div>
        );
      },
    },
    {
      accessorKey: "latest_trade_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Latest Trade Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.latest_trade_date
          ? new Date(row.original.latest_trade_date)
          : null;
        return (
          <div className="text-center">
            {date ? date.toLocaleDateString() : "N/A"}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">Polymarket Markets</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="w-full sm:w-auto">
              <Label>Search Markets</Label>
              <Input
                placeholder="Search by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Markets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Label>Minimum Trades</Label>
              <Select
                value={minTradesFilter ? "MORE_THAN_ONE" : "ALL"}
                onValueChange={(v) => setMinTradesFilter(v === "MORE_THAN_ONE")}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Markets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Markets</SelectItem>
                  <SelectItem value="MORE_THAN_ONE">
                    More Than 1 Trade
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Label>Insider Score</Label>
              <Select
                value={insiderScoreFilter ? "HIGH" : "ALL"}
                onValueChange={(v) => setInsiderScoreFilter(v === "HIGH")}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Scores</SelectItem>
                  <SelectItem value="HIGH">Score ≥ 0.6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={exportAllTrades}>
              Export All Trades CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="text-center py-8">
              Loading Polymarket markets...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600">
              Error: {error.message}
            </div>
          )}
          {!isLoading && !error && (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredMarkets.length} market
                {filteredMarkets.length !== 1 ? "s" : ""}
              </div>
              <DataTable
                data={filteredMarkets}
                columns={columns}
                onRowClick={(row) => navigate(`/polymarket/${row.id}`)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
