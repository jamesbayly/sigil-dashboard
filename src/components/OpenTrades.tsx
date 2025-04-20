import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useOpenTrades } from "@/hooks/useOpenTrades";
import { Button } from "@/components/ui/button";

export default function OpenTrades() {
  const { trades, strategies, symbols, onClose, onCloseAll } = useOpenTrades();
  const [closingAll, setClosingAll] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Open Trades</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Close All</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <p>Are you sure you want to close ALL open trades?</p>
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

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Strategy</th>
              <th>Size (USD)</th>
              <th>Open Price</th>
              <th>PnL $</th>
              <th>PnL %</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const sym = symbols.find((s) => s.id === t.symbol_id);
              const strat = strategies.find((s) => s.id === t.strategy_id);
              const pnl = t.pnl_amount ?? 0;
              const pct = t.pnl_percent ?? 0;
              const rowClass = pnl >= 0 ? "bg-green-50" : "bg-red-50";
              return (
                <tr key={t.id} className={rowClass}>
                  <td>{sym?.symbol}</td>
                  <td>{strat?.code}</td>
                  <td>${t.size.toFixed(2)}</td>
                  <td>${t.open_price.toFixed(2)}</td>
                  <td>${pnl.toFixed(2)}</td>
                  <td>{pct.toFixed(2)}%</td>
                  <td className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          Close
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <p>Close trade #{t.id}?</p>
                        <AlertDialogAction onClick={() => onClose(t.id)}>
                          Yes, close
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
