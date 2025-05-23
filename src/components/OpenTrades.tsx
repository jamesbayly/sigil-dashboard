import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useOpenTrades } from "@/hooks/useOpenTrades";
import { Button } from "@/components/ui/button";
import TimeAgo from "react-timeago";
import { useSymbols } from "@/hooks/useSymbols";
import { useStrategies } from "@/hooks/useStrategies";
import { Trades } from "@/types";
import TradeView from "./Trade";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { ArrowUpDown } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function OpenTrades() {
  const { trades, onCloseAll } = useOpenTrades();
  const { symbols } = useSymbols();
  const { strategies } = useStrategies();
  const [closingAll, setClosingAll] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trades | undefined>(
    undefined
  );

  const [tradeTypesFilter, setTradeTypesFilter] = useState<"REAL" | "ALL">(
    "REAL"
  );
  const [filteredTrades, setFilteredTrades] = useState<Trades[]>([]);

  const columns: ColumnDef<Trades>[] = [
    {
      accessorKey: "symbol_id",
      header: "Symbol",
      cell: ({ row }) => {
        const sym = symbols.find((s) => s.id === row.original.symbol_id);
        return <span>{sym?.symbol}</span>;
      },
    },
    {
      accessorKey: "strategy_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Strategy
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const strat = strategies.find((s) => s.id === row.original.strategy_id);
        return <span>{strat?.name}</span>;
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <span>{row.original.open_binance_order_id ? "REAL" : "TEST"}</span>
        );
      },
    },
    {
      accessorKey: "open_time",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Opened
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <TimeAgo date={row.original.open_time} />;
      },
    },
    {
      accessorKey: "size",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Size (USD)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span>
            $
            {parseFloat(
              (row.original.size * row.original.open_price).toFixed(2)
            ).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "open_price",
      header: "Open Price",
      cell: ({ row }) => {
        return (
          <span>
            ${parseFloat(row.original.open_price.toFixed(2)).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "close_price",
      header: "Current Price",
      cell: ({ row }) => {
        return (
          <span>
            {row.original.close_price
              ? "$" +
                parseFloat(row.original.close_price.toFixed(2)).toLocaleString()
              : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "pnl_percent",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Current PnL (%)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span>
            {row.original.pnl_percent
              ? row.original.pnl_percent.toFixed(2) + "%"
              : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "take_profit_price",
      header: "Target Price",
      cell: ({ row }) => {
        return (
          <span>
            {row.original.take_profit_price
              ? "$" +
                parseFloat(
                  row.original.take_profit_price.toFixed(2)
                ).toLocaleString()
              : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "stop_loss_percent",
      header: "Trailing Stop (%)",
      cell: ({ row }) => {
        return <span>{row.original.stop_loss_percent?.toFixed(2) + "%"}</span>;
      },
    },
  ];

  // Update filteredTrades when trades or tradeTypesFilter changes
  useEffect(() => {
    if (tradeTypesFilter === "REAL") {
      setFilteredTrades(trades.filter((t) => t.open_binance_order_id));
    } else {
      setFilteredTrades(trades);
    }
  }, [trades, tradeTypesFilter]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Open Trades</h2>
        <div>
          <Tabs
            value={tradeTypesFilter}
            onValueChange={(value) =>
              setTradeTypesFilter(value as "REAL" | "ALL")
            }
            className="w-[400px]"
          >
            <TabsList>
              <TabsTrigger value="REAL">Real Trades Only</TabsTrigger>
              <TabsTrigger value="ALL">ALL Trades</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Close All</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <p>
              Are you sure you want to close ALL open trades (both real and
              test)?
            </p>
            <AlertDialogAction
              onClick={async () => {
                setClosingAll(true);
                await onCloseAll();
                setClosingAll(false);
              }}
            >
              {closingAll ? "Closing…" : "Yes, close all"}
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="flex-auto">
          <CardHeader>
            <CardTitle>
              $
              {filteredTrades
                .reduce((acc, t) => acc + (t.pnl_amount || 0), 0)
                .toFixed(2)}
            </CardTitle>
            <CardDescription>Current Open PNL</CardDescription>
          </CardHeader>
        </Card>
        <Card className="flex-auto">
          <CardHeader>
            <CardTitle>{filteredTrades.length.toLocaleString()}</CardTitle>
            <CardDescription>Total Trades</CardDescription>
          </CardHeader>
        </Card>
        <Card className="flex-auto">
          <CardHeader>
            <CardTitle>
              {filteredTrades.length > 0
                ? (
                    (filteredTrades.filter((t) => (t.pnl_amount ?? 0) > 0)
                      .length /
                      filteredTrades.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </CardTitle>
            <CardDescription>Winning Rate</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="overflow-auto">
        <DataTable
          data={filteredTrades}
          columns={columns}
          onRowClick={setSelectedTrade}
        />
      </div>
      <TradeView
        trade={selectedTrade}
        closeSelf={() => setSelectedTrade(undefined)}
      />
    </div>
  );
}
