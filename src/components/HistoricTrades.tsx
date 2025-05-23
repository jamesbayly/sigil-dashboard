import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHistoricTrades } from "@/hooks/useHistoricTrades";
import { useSymbols } from "@/hooks/useSymbols";
import { useStrategies } from "@/hooks/useStrategies";
import { Trades } from "@/types";
import TradeView from "./Trade";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { calculateZellaScore } from "@/lib/zellaScoreHelper";
import { useHistoricMarketState } from "@/hooks/useHistoricMarketState";
import { DateRange } from "react-day-picker";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function HistoricTrades() {
  const { symbols } = useSymbols();
  const { strategies } = useStrategies();
  const [stratFilter, setStratFilter] = useState<number | undefined>();
  const [symFilter, setSymFilter] = useState<number | undefined>();
  const [selectedTrade, setSelectedTrade] = useState<Trades | undefined>(
    undefined
  );
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [tradeTypesFilter, setTradeTypesFilter] = useState<"REAL" | "ALL">(
    "REAL"
  );
  const [filteredTrades, setFilteredTrades] = useState<Trades[]>([]);
  const { trades } = useHistoricTrades(date, stratFilter, symFilter);
  const { marketState } = useHistoricMarketState(date);

  // Update filteredTrades when trades or tradeTypesFilter changes
  useEffect(() => {
    if (tradeTypesFilter === "REAL") {
      setFilteredTrades(trades.filter((t) => t.open_binance_order_id));
    } else {
      setFilteredTrades(trades);
    }
  }, [trades, tradeTypesFilter]);

  // compute cumulative PnL
  const graphData = filteredTrades
    .slice()
    .reverse()
    .filter((t) => t.close_time)
    .map((t, i, a) => {
      const marketStateAtDate = marketState.find(
        (m) => new Date(m.created_at) <= new Date(t.close_time || Date.now())
      );
      const marketPctAtDate =
        (((marketStateAtDate?.market_cap || 0) -
          marketState[marketState.length - 1].market_cap) /
          marketState[marketState.length - 1].market_cap) *
        100;
      return {
        ...t,
        date: t.close_time,
        cum_pnl: a
          .slice(0, i + 1)
          .reduce((acc, t) => acc + (t.pnl_amount ?? 0), 0),
        market_pct_change: marketPctAtDate,
      };
    });

  const getDayBreakdown = (date: Date) => {
    const dayTrades = filteredTrades.filter(
      (t) =>
        t.close_time &&
        t.close_time.slice(0, 10) === date.toISOString().slice(0, 10)
    );
    return {
      trade_count: dayTrades.length,
      total_pnl: dayTrades.reduce((acc, t) => acc + (t.pnl_amount || 0), 0),
      win_rate:
        dayTrades.length > 0
          ? (
              (dayTrades.filter((t) => (t.pnl_amount ?? 0) > 0).length /
                dayTrades.length) *
              100
            ).toFixed(1)
          : 0,
    };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Historic Trades</h2>

      {/* filters */}
      <div className="flex flex-wrap gap-4 align-end">
        <div>
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="flex w-auto flex-col space-y-2 p-2"
              align="start"
            >
              <Select
                onValueChange={(value) =>
                  setDate({
                    from: addDays(new Date(), parseInt(value) * -1),
                    to: new Date(),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="3">Last 3 days</SelectItem>
                  <SelectItem value="7">Last week</SelectItem>
                  <SelectItem value="14">Last fortnight</SelectItem>
                  <SelectItem value="30">Last month</SelectItem>
                </SelectContent>
              </Select>
              <div className="rounded-md border">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Strategy</Label>
          <Select
            onValueChange={(v) => setStratFilter(Number(v))}
            value={stratFilter?.toString()}
          >
            <SelectTrigger className="w-40">
              {strategies.find((s) => s.id === stratFilter)?.name ?? "All"}
            </SelectTrigger>
            <SelectContent>
              {strategies.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Symbol</Label>
          <Select
            onValueChange={(v) => setSymFilter(Number(v))}
            value={symFilter?.toString()}
          >
            <SelectTrigger className="w-40">
              {symbols.find((s) => s.id === symFilter)?.symbol ?? "All"}
            </SelectTrigger>
            <SelectContent>
              {symbols.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      </div>

      <div className="h-64 bg-white dark:bg-gray-800 p-4 rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData}>
            <XAxis dataKey="date" tickFormatter={(tick) => tick.slice(0, 10)} />
            <YAxis />
            <YAxis yAxisId={1} hide={true} />
            <Tooltip />
            <Line
              label="PNL"
              type="monotone"
              dataKey="pnl"
              stroke="#3b82f6"
              dot={false}
            />
            <Line
              label="Cumulative PNL"
              type="monotone"
              dataKey="cum_pnl"
              stroke="#22c55e"
              dot={false}
            />
            <Line
              label="Total Market Return"
              type="monotone"
              dataKey="market_pct_change"
              stroke="#f97316"
              dot={false}
              yAxisId={1}
            />
            <ReferenceLine label="Break Even" y="0" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3>Summary</h3>
        <div className="flex flex-wrap gap-4">
          <Card className="flex-auto">
            <CardHeader>
              <CardTitle>{calculateZellaScore(filteredTrades)}</CardTitle>
              <CardDescription>Zella Score</CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-auto">
            <CardHeader>
              <CardTitle>
                $
                {filteredTrades
                  .reduce((acc, t) => acc + (t.pnl_amount || 0), 0)
                  .toFixed(2)}
              </CardTitle>
              <CardDescription>Total PNL</CardDescription>
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
              <CardDescription>Win Rate</CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-auto">
            <CardHeader>
              <CardTitle>
                {marketState && marketState.length > 0
                  ? (
                      ((marketState[0].market_cap -
                        marketState[marketState.length - 1].market_cap) /
                        marketState[marketState.length - 1].market_cap) *
                      100
                    ).toFixed(1) + "%"
                  : "N/A"}
              </CardTitle>
              <CardDescription>Market Return</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div>
        <h3>Daily Breakdown</h3>
        <div className="flex flex-nowrap gap-4 overflow-scroll">
          {[
            ...new Set(
              filteredTrades
                .filter((t) => t.close_time)
                .map((t) => t.close_time?.slice(0, 10))
            ),
          ].map((date) => {
            const breakdown = getDayBreakdown(new Date(date || ""));
            return (
              <Card key={date} className="flex-auto">
                <CardHeader>
                  <CardTitle>{date}</CardTitle>
                  <CardDescription>
                    <p>{breakdown.trade_count} trades</p>
                    <p>Total PNL: ${breakdown.total_pnl.toFixed(2)}</p>
                    <p>Win Rate: {breakdown.win_rate}%</p>
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* list */}
      <div className="overflow-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Close Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>PnL $</TableHead>
              <TableHead>PnL %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrades.map((t) => {
              const sym = symbols.find((s) => s.id === t.symbol_id);
              const strat = strategies.find((s) => s.id === t.strategy_id);
              const pnl = t.pnl_amount ?? 0;
              const pct = t.pnl_percent ?? 0;
              const bg =
                pnl > 0
                  ? "bg-green-50 dark:bg-green-900"
                  : pnl < 0
                  ? "bg-red-50 dark:bg-red-900"
                  : "";
              return (
                <TableRow
                  key={t.id}
                  className={bg}
                  onClick={() => setSelectedTrade(t)}
                >
                  <TableCell>{t.close_time}</TableCell>
                  <TableCell>
                    {t.open_binance_order_id ? "REAL" : "TEST"}
                  </TableCell>
                  <TableCell>{sym?.symbol}</TableCell>
                  <TableCell>{strat?.name}</TableCell>
                  <TableCell>${pnl.toFixed(2)}</TableCell>
                  <TableCell>{pct.toFixed(2)}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <TradeView
        trade={selectedTrade}
        closeSelf={() => setSelectedTrade(undefined)}
      />
    </div>
  );
}
