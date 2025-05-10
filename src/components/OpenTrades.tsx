import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trades } from "@/types";
import TradeView from "./Trade";

export default function OpenTrades() {
  const { trades, onClose, onCloseAll } = useOpenTrades();
  const { symbols } = useSymbols();
  const { strategies } = useStrategies();
  const [closingAll, setClosingAll] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trades | undefined>(
    undefined
  );

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
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Size (USD)</TableHead>
              <TableHead>Open Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Current Profit</TableHead>
              <TableHead>Target Price</TableHead>
              <TableHead>Trailing Stop (%)</TableHead>
              <th />
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((t) => {
              const sym = symbols.find((s) => s.id === t.symbol_id);
              const strat = strategies.find((s) => s.id === t.strategy_id);
              const bg =
                (t.pnl_amount || 0) > 0
                  ? "bg-green-50 dark:bg-green-900"
                  : (t.pnl_amount || 0) < 0
                  ? "bg-red-50 dark:bg-red-900"
                  : "";
              return (
                <TableRow
                  key={t.id}
                  className={bg}
                  onClick={() => setSelectedTrade(t)}
                >
                  <TableCell>{sym?.symbol}</TableCell>
                  <TableCell>{strat?.name}</TableCell>
                  <TableCell>
                    <TimeAgo date={t.open_time} />
                  </TableCell>
                  <TableCell>${(t.size * t.open_price).toFixed(2)}</TableCell>
                  <TableCell>${t.open_price.toFixed(2)}</TableCell>
                  <TableCell>
                    {t.close_price ? "$" + t.close_price.toFixed(2) : ""}
                  </TableCell>
                  <TableCell>
                    {t.pnl_percent ? t.pnl_percent.toFixed(2) + "%" : ""}
                  </TableCell>
                  <TableCell>${t.take_profit_price?.toFixed(2)}</TableCell>
                  <TableCell>{t.stop_loss_percent?.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
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
