import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
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

export default function HistoricTrades() {
  const { symbols } = useSymbols();
  const { strategies } = useStrategies();
  const [stratFilter, setStratFilter] = useState<number | undefined>();
  const [symFilter, setSymFilter] = useState<number | undefined>();
  const [selectedTrade, setSelectedTrade] = useState<Trades | undefined>(
    undefined
  );
  const { trades, isLoading, sentinel } = useHistoricTrades(
    25,
    stratFilter,
    symFilter
  );

  // compute cumulative PnL
  const graphData = trades
    .slice()
    .reverse()
    .map((t) => ({
      date: t.close_time?.slice(0, 10) ?? "",
      pnl: t.pnl_amount ?? 0,
    }))
    .map((t, i, a) => {
      return {
        ...t,
        cum_pnl: a.slice(0, i + 1).reduce((acc, t) => acc + t.pnl, 0),
      };
    });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Historic Trades</h2>

      {/* filters */}
      <div className="flex flex-wrap gap-4">
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
      </div>

      <div className="h-64 bg-white dark:bg-gray-800 p-4 rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData}>
            <XAxis dataKey="date" />
            <YAxis />
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
            <ReferenceLine label="Break Even" y="0" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* list */}
      <div className="overflow-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Close Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>PnL $</TableHead>
              <TableHead>PnL %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((t) => {
              const sym = symbols.find((s) => s.id === t.symbol_id);
              const strat = strategies.find((s) => s.id === t.strategy_id);
              const pnl = t.pnl_amount ?? 0;
              const pct = t.pnl_percent ?? 0;
              const bg = pnl >= 0 ? "bg-green-50" : "bg-red-50";
              return (
                <TableRow
                  key={t.id}
                  className={bg}
                  onClick={() => setSelectedTrade(t)}
                >
                  <TableCell>{t.close_time?.slice(0, 10)}</TableCell>
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
      <div ref={sentinel} className="h-10 text-center">
        {isLoading ? "Loading…" : "Scroll for more"}
      </div>
      <TradeView
        trade={selectedTrade}
        closeSelf={() => setSelectedTrade(undefined)}
      />
    </div>
  );
}
