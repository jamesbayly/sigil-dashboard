import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import { Link } from "react-router-dom";
import { getNumberStyling } from "@/lib/utils";
import SymbolPopover from "./SymbolPopover";
import SymbolSelector from "./SymbolSelector";
import { useAuth } from "@/hooks/useAuth";

export default function OpenTrades() {
  const { trades, onCloseAll } = useOpenTrades();
  const { isAuthenticated } = useAuth();
  const { symbols } = useSymbols();
  const { strategies } = useStrategies();
  const [closingAll, setClosingAll] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trades | undefined>(
    undefined,
  );

  const [tradeTypesFilter, setTradeTypesFilter] = useState<"REAL" | "ALL">(
    "ALL",
  );
  const [strategyFilter, setStrategyFilter] = useState<number | undefined>();
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>();
  const [filteredTrades, setFilteredTrades] = useState<Trades[]>([]);

  const columns: ColumnDef<Trades>[] = [
    {
      id: "symbol",
      accessorFn: (row) => {
        const sym = symbols.find((s) => s.id === row.symbol_id);
        return sym?.symbol || "";
      },
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
        const sym = symbols.find((s) => s.id === row.original.symbol_id);
        return <SymbolPopover symbolId={row.original.symbol_id} symbol={sym} />;
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
      cell: ({ row }) => {
        return (
          <span>{row.original.open_binance_order_id ? "REAL" : "TEST"}</span>
        );
      },
    },
    {
      accessorKey: "conviction",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Conviction
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className={`${getNumberStyling(row.original.conviction, 0.3)}`}>
            {Math.round(row.original.conviction * 100)}%
          </span>
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
              (row.original.size * row.original.open_price).toFixed(2),
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
                  row.original.take_profit_price.toFixed(2),
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
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTrade(row.original)}
          >
            View
          </Button>
        );
      },
    },
  ];

  // Update filteredTrades when trades, tradeTypesFilter, strategyFilter, or symbolFilter changes
  useEffect(() => {
    let filtered = trades;

    // Apply trade type filter
    if (tradeTypesFilter === "REAL") {
      filtered = filtered.filter((t) => t.open_binance_order_id);
    }

    // Apply strategy filter
    if (strategyFilter !== undefined) {
      filtered = filtered.filter((t) => t.strategy_id === strategyFilter);
    }

    // Apply symbol filter
    if (symbolFilter !== undefined) {
      filtered = filtered.filter((t) => t.symbol_id === symbolFilter);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredTrades(filtered);
  }, [trades, tradeTypesFilter, strategyFilter, symbolFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">Open Trades</h2>
        {isAuthenticated ?? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                Close All
              </Button>
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
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-stretch sm:items-end">
        <div className="w-full sm:w-auto">
          <Label>Strategy</Label>
          <Select
            onValueChange={(v) =>
              setStrategyFilter(v === "all" ? undefined : Number(v))
            }
            value={strategyFilter?.toString() ?? "all"}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue>
                {strategies.find((s) => s.id === strategyFilter)?.name ?? "All"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {strategies.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <SymbolSelector value={symbolFilter} onChange={setSymbolFilter} />
        </div>

        <div className="w-full sm:w-auto">
          <Tabs
            value={tradeTypesFilter}
            onValueChange={(value) =>
              setTradeTypesFilter(value as "REAL" | "ALL")
            }
            className="w-full sm:w-[400px]"
          >
            <TabsList className="w-full">
              <TabsTrigger value="REAL" className="flex-1">
                Real Trades Only
              </TabsTrigger>
              <TabsTrigger value="ALL" className="flex-1">
                ALL Trades
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>{filteredTrades.length.toLocaleString()}</CardTitle>
            <CardDescription>Total Trades</CardDescription>
          </CardHeader>
        </Card>
        <Card>
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

      <div>
        <DataTable data={filteredTrades} columns={columns} />
      </div>
      <TradeView
        trade={selectedTrade}
        closeSelf={() => setSelectedTrade(undefined)}
      />
    </div>
  );
}
