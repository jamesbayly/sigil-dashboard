import { useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { PaginationControls } from "./ui/pagination-controls";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOpenPolymarketTrades } from "@/hooks/useOpenPolymarketTrades";
import { useHistoricPolymarketTrades } from "@/hooks/useHistoricPolymarketTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { type PolymarketTrades, StrategyType } from "@/types";
import TradeView from "./Trade";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { exportCSV, getNumberStyling, isRealTrade } from "@/lib/utils";

export default function PolymarketTrades() {
  const { trades: openTrades } = useOpenPolymarketTrades();
  const {
    trades: historicTrades,
    pagination,
    setPage,
    setLimit,
  } = useHistoricPolymarketTrades(undefined);

  const { strategies } = useStrategies();
  const [marketFilter, setMarketFilter] = useState<number | undefined>();
  const [strategyFilter, setStrategyFilter] = useState<number | undefined>();

  // derive available markets from open trades only
  const derivedMarkets = (() => {
    const map = new Map<number, string>();
    openTrades.forEach((t) => {
      const pt = t as PolymarketTrades;
      map.set(pt.polymarket_market_id, pt.polymarket_market_title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  })();

  const [tradeTypesFilter, setTradeTypesFilter] = useState<"REAL" | "ALL">(
    "ALL",
  );
  const [selectedTrade, setSelectedTrade] = useState<
    PolymarketTrades | undefined
  >(undefined);

  const [filteredOpen, setFilteredOpen] =
    useState<PolymarketTrades[]>(openTrades);

  const [filteredHistoric, setFilteredHistoric] =
    useState<PolymarketTrades[]>(historicTrades);

  const exportTradesToCsv = (
    tradesToExport: PolymarketTrades[],
    filename = "polymarket_trades.csv",
  ) => {
    if (!tradesToExport || tradesToExport.length === 0) {
      return;
    }

    exportCSV(
      filename,
      "id,market_id,market_title,insider_trading_score,outcome,strategy_id,type,conviction,open_time,size,open_price,total_value,current_price,current_pnl_amount,current_pnl_percent",
      tradesToExport.map((t) => [
        t.id,
        t.polymarket_market_id,
        t.polymarket_market_title,
        t.polymarket_insider_trading_score,
        t.outcome,
        t.strategy_id,
        isRealTrade(t) ? "REAL" : "TEST",
        t.conviction,
        t.open_time,
        t.size,
        t.open_price,
        t.open_price * t.size,
        t.close_price ?? "",
        t.pnl_amount,
        t.pnl_percent ?? "",
      ]),
    );
  };

  useEffect(() => {
    let open = openTrades;
    let historic = historicTrades;

    if (tradeTypesFilter === "REAL") {
      open = open.filter((t) => isRealTrade(t));
      historic = historic.filter((t) => isRealTrade(t));
    }

    if (marketFilter !== undefined) {
      open = open.filter(
        (t) => (t as PolymarketTrades).polymarket_market_id === marketFilter,
      );
      historic = historic.filter(
        (t) => (t as PolymarketTrades).polymarket_market_id === marketFilter,
      );
    }

    if (strategyFilter !== undefined) {
      open = open.filter((t) => t.strategy_id === strategyFilter);
      historic = historic.filter((t) => t.strategy_id === strategyFilter);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredOpen(open);
    setFilteredHistoric(historic);
  }, [
    openTrades,
    historicTrades,
    tradeTypesFilter,
    marketFilter,
    strategyFilter,
  ]);

  const columns = (
    [
      {
        accessorKey: "polymarket_market_title",
        header: "Market",
        cell: ({ row }) => {
          // Polymarket trades include `polymarket_market_title`
          return (
            <Link
              to={`/polymarket/${(row.original as PolymarketTrades).polymarket_market_id}`}
              className="hover:text-blue-800 underline"
            >
              {(row.original as PolymarketTrades).polymarket_market_title ||
                "NA"}
            </Link>
          );
        },
      },
      {
        accessorKey: "outcome",
        header: "Outcome",
        cell: ({ row }) => {
          return (
            <span
              className={
                (row.original as PolymarketTrades).outcome === "YES"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {(row.original as PolymarketTrades).outcome || ""}
            </span>
          );
        },
      },
      {
        accessorKey: "strategy_id",
        header: "Strategy",
        cell: ({ row }) => {
          const strat = strategies.find(
            (s) => s.id === row.original.strategy_id,
          );
          return (
            <Link
              to={`/strategies/${strat?.id}`}
              className="hover:text-blue-800 underline"
            >
              {strat?.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span>{isRealTrade(row.original) ? "REAL" : "TEST"}</span>
        ),
      },
      {
        accessorKey: "conviction",
        header: "Conviction",
        cell: ({ row }) => (
          <span className={getNumberStyling(row.original.conviction, 0.3)}>
            {Math.round(row.original.conviction * 100)}%
          </span>
        ),
      },
      {
        accessorKey: "open_time",
        header: "Opened",
        cell: ({ row }) => <TimeAgo date={row.original.open_time} />,
      },
      {
        accessorKey: "size",
        header: "Size (USD)",
        cell: ({ row }) => (
          <span>
            $
            {parseFloat(
              (row.original.size * row.original.open_price).toFixed(2),
            ).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "open_price",
        header: "Open Price",
        cell: ({ row }) => (
          <span>
            ${parseFloat(row.original.open_price.toFixed(2)).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "close_price",
        header: "Current Price",
        cell: ({ row }) => (
          <span>
            {row.original.close_price
              ? "$" +
                parseFloat(row.original.close_price.toFixed(2)).toLocaleString()
              : ""}
          </span>
        ),
      },
      {
        accessorKey: "pnl_percent",
        header: "PnL %",
        cell: ({ row }) => {
          return (
            <span className={getNumberStyling(row.original.pnl_percent ?? 0)}>
              {(row.original.pnl_percent ?? 0).toFixed(2)}%
            </span>
          );
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTrade(row.original)}
          >
            View
          </Button>
        ),
      },
    ] as ColumnDef<PolymarketTrades>[]
  ).filter(Boolean) as ColumnDef<PolymarketTrades>[];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Polymarket Trades</h2>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">Open Polymarket Trades</h3>
            <div className="flex gap-3 items-end">
              <div>
                <Label>Market</Label>
                <Select
                  onValueChange={(v) =>
                    setMarketFilter(v === "all" ? undefined : Number(v))
                  }
                  value={marketFilter?.toString() ?? "all"}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="all">All</SelectItem>
                    {derivedMarkets.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Strategy</Label>
                <Select
                  onValueChange={(v) =>
                    setStrategyFilter(v === "all" ? undefined : Number(v))
                  }
                  value={strategyFilter?.toString() ?? "all"}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="all">All</SelectItem>
                    {strategies
                      .filter(
                        (s) => s.strategy_type === StrategyType.POLYMARKET,
                      )
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="self-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    exportTradesToCsv(
                      filteredOpen,
                      "open_polymarket_trades.csv",
                    )
                  }
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <Tabs
            value={tradeTypesFilter}
            onValueChange={(v) => setTradeTypesFilter(v as "REAL" | "ALL")}
            className="w-[300px]"
          >
            <TabsList>
              <TabsTrigger value="REAL">Real Trades Only</TabsTrigger>
              <TabsTrigger value="ALL">ALL Trades</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  $
                  {filteredOpen
                    .reduce((acc, t) => acc + (t.pnl_amount || 0), 0)
                    .toFixed(2)}
                </CardTitle>
                <CardDescription>Total PNL</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{filteredOpen.length.toLocaleString()}</CardTitle>
                <CardDescription>Total Trades</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {filteredOpen.length > 0
                    ? (
                        (filteredOpen.filter((t) => (t.pnl_amount ?? 0) > 0)
                          .length /
                          filteredOpen.length) *
                        100
                      ).toFixed(1) + "%"
                    : "0%"}
                </CardTitle>
                <CardDescription>Win Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <DataTable data={filteredOpen} columns={columns} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Historic Polymarket Trades</h3>
        </div>

        <div>
          {pagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
          <div className="flex items-center justify-end mb-2">
            <Button
              variant="outline"
              onClick={() =>
                exportTradesToCsv(
                  filteredHistoric,
                  "historic_polymarket_trades.csv",
                )
              }
            >
              Export CSV
            </Button>
          </div>
          <DataTable data={filteredHistoric} columns={columns} />
        </div>
      </div>

      <TradeView
        trade={selectedTrade}
        closeSelf={() => setSelectedTrade(undefined)}
      />
    </div>
  );
}
