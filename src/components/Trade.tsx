import { useSymbols } from "@/hooks/useSymbols";
import { Trades } from "@/types";
import { Button } from "./ui/button";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useOpenTrades } from "@/hooks/useOpenTrades";

interface TradeViewProps {
  trade: Trades | undefined;
  closeSelf: (updatedTrade: Trades | undefined) => void;
}

const TradeView: React.FC<TradeViewProps> = ({ trade, closeSelf }) => {
  const { onClose } = useOpenTrades();
  const { symbols } = useSymbols(false);
  const symbol = symbols.find((s) => s.id === trade?.symbol_id);

  const isOpen = !!trade && !trade.close_time;

  return (
    <Dialog open={!!trade} onOpenChange={() => closeSelf(undefined)}>
      <DialogContent className="max-h-screen max-w-full flex flex-col overflow-scroll">
        <DialogHeader>
          <DialogTitle>
            Trade {trade?.id} - {symbol?.name}
          </DialogTitle>
          <DialogDescription>
            {isOpen ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-red-600">
                    Close
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <p>Close trade #{trade?.id}?</p>
                  <AlertDialogAction onClick={() => onClose(trade?.id ?? 0)}>
                    Yes, close
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        {trade ? (
          <div>
            <h2>Trade</h2>
            <div className="space-y-4">
              <p>
                <strong>Strategy ID:</strong> {trade.strategy_id}
              </p>
              <p>
                <strong>Symbol ID:</strong> {trade.symbol_id}
              </p>
              <p>
                <strong>Size:</strong> {trade.size}
              </p>
              <p>
                <strong>Size USD:</strong> $
                {(trade.size * trade.open_price).toFixed(2)}
              </p>
              <p>
                <strong>Open Time:</strong>{" "}
                {new Date(trade.open_time).toLocaleString()}
              </p>
              <p>
                <strong>Open Price:</strong> ${trade.open_price.toFixed(2)}
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Open Notes:</strong>
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border max-w-full">
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {trade.open_notes || "N/A"}
                  </p>
                </div>
              </div>
              <p>
                <strong>Open Fees:</strong> ${trade.open_fees.toFixed(2)}
              </p>
              {trade.open_binance_order_id && (
                <p>
                  <strong>Open Binance Order ID:</strong>{" "}
                  {trade.open_binance_order_id}
                </p>
              )}
              {trade.take_profit_price && (
                <p>
                  <strong>Take Profit Price:</strong> $
                  {trade.take_profit_price.toFixed(2)}
                </p>
              )}
              {trade.stop_loss_percent && (
                <p>
                  <strong>Stop Loss Percent:</strong>{" "}
                  {trade.stop_loss_percent.toFixed(2)}%
                </p>
              )}
              {trade.close_time && (
                <p>
                  <strong>Close Time:</strong>{" "}
                  {new Date(trade.close_time).toLocaleString()}
                </p>
              )}
              {trade.close_price && (
                <p>
                  <strong>Close Price:</strong> ${trade.close_price.toFixed(2)}
                </p>
              )}
              {trade.close_notes && (
                <div className="space-y-2">
                  <p>
                    <strong>Close Notes:</strong>
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border max-w-full">
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {trade.close_notes}
                    </p>
                  </div>
                </div>
              )}
              {trade.close_fees && (
                <p>
                  <strong>Close Fees:</strong> ${trade.close_fees.toFixed(2)}
                </p>
              )}
              {trade.close_binance_order_id && (
                <p>
                  <strong>Close Binance Order ID:</strong>{" "}
                  {trade.close_binance_order_id}
                </p>
              )}
              {trade.fees && (
                <p>
                  <strong>Total Fees:</strong> ${trade.fees.toFixed(2)}
                </p>
              )}
              {trade.pnl_amount_fee_exclusive && (
                <p>
                  <strong>PNL Amount (Fee Exclusive):</strong> $
                  {trade.pnl_amount_fee_exclusive.toFixed(2)}
                </p>
              )}
              {trade.pnl_percent && (
                <p>
                  <strong>PNL Percent:</strong> {trade.pnl_percent.toFixed(2)}%
                </p>
              )}
              {trade.pnl_amount && (
                <p>
                  <strong>PNL Amount:</strong> ${trade.pnl_amount.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TradeView;
