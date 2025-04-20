import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOpenTrades } from "@/hooks/useOpenTrades";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useHistoricTrades } from "@/hooks/useHistoricTrades";

export default function HistoricTrades() {
  const { strategies, symbols } = useOpenTrades();
  const [stratFilter, setStratFilter] = useState<number | undefined>();
  const [symFilter, setSymFilter] = useState<number | undefined>();
  const { trades, loading, sentinel } = useHistoricTrades(
    25,
    stratFilter,
    symFilter
  );

  // compute cumulative PnL
  const data = trades
    .slice()
    .reverse() // older first
    .map((t, idx, arr) => ({
      date: t.close_time?.slice(0, 10) ?? "",
      pnl: t.pnl_amount ?? 0,
      cum: (idx > 0 ? arr[idx - 1].pnl_amount ?? 0 : 0) + (t.pnl_amount ?? 0),
    }));

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
              {strategies.find((s) => s.id === stratFilter)?.code ?? "All"}
            </SelectTrigger>
            <SelectContent>
              {strategies.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.code}
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

      {/* chart */}
      <div className="h-64 bg-white dark:bg-gray-800 p-4 rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cum" stroke="#3b82f6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* list */}
      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Strategy</th>
              <th>PnL $</th>
              <th>PnL %</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const sym = symbols.find((s) => s.id === t.symbol_id);
              const strat = strategies.find((s) => s.id === t.strategy_id);
              const pnl = t.pnl_amount ?? 0;
              const pct = t.pnl_percent ?? 0;
              const bg = pnl >= 0 ? "bg-green-50" : "bg-red-50";
              return (
                <tr key={t.id} className={bg}>
                  <td>{t.close_time?.slice(0, 10)}</td>
                  <td>{sym?.symbol}</td>
                  <td>{strat?.code}</td>
                  <td>${pnl.toFixed(2)}</td>
                  <td>{pct.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div ref={sentinel} className="h-10 text-center">
        {loading ? "Loading…" : "Scroll for more"}
      </div>
    </div>
  );
}
