import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { getNumberStyling } from "@/lib/utils";
import { SymbolsResponse } from "@/types";
import { Link } from "react-router-dom";

interface SymbolPopoverProps {
  symbolId: number;
  symbol: SymbolsResponse | undefined;
  className?: string;
}

export default function SymbolPopover({
  symbolId,
  symbol,
  className = "",
}: SymbolPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!symbol) {
    return <span className={className}>{symbolId}</span>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span className={`underline cursor-pointer ${className}`}>
          {symbol.name} ({symbol.symbol})
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header with symbol name and type */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/symbols/${symbol.id}`}
                className="font-semibold text-lg underline cursor-pointer"
              >
                {symbol.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {symbol.symbol} • ID: #{symbol.id}
              </p>
            </div>
            <Badge variant="outline">{symbol.symbol_type}</Badge>
          </div>

          {/* 24h Change */}
          {symbol.day_change_percent !== undefined &&
            symbol.day_change_percent !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">24h Change:</span>
                <span
                  className={`text-sm font-semibold ${getNumberStyling(
                    symbol.day_change_percent
                  )}`}
                >
                  {symbol.day_change_percent > 0 ? "+" : ""}
                  {symbol.day_change_percent.toFixed(2)}%
                </span>
              </div>
            )}

          {/* 1h Change */}
          {symbol.hour_change_percent !== undefined &&
            symbol.hour_change_percent !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">1h Change:</span>
                <span
                  className={`text-sm font-semibold ${getNumberStyling(
                    symbol.hour_change_percent
                  )}`}
                >
                  {symbol.hour_change_percent > 0 ? "+" : ""}
                  {symbol.hour_change_percent.toFixed(2)}%
                </span>
              </div>
            )}

          {/* Market Cap for applicable symbols */}
          {symbol.market_cap && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Market Cap:</span>
              <span className="text-sm">
                ${symbol.market_cap.toLocaleString()}M
              </span>
            </div>
          )}

          {/* CoinGecko Rank */}
          {symbol.cg_rank && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CG Rank:</span>
              <span className="text-sm">#{symbol.cg_rank}</span>
            </div>
          )}

          {/* Option Score for STOCK symbols */}
          {symbol.symbol_type === "STOCK" && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Option Score:</span>
                <span className="text-sm font-semibold">
                  <span className={getNumberStyling(symbol.option_score)}>
                    {symbol.option_score.toFixed(3)}
                  </span>{" "}
                  <span
                    className={getNumberStyling(
                      symbol.option_score - symbol.option_score_prev
                    )}
                  >
                    (Δ{" "}
                    {(symbol.option_score - symbol.option_score_prev).toFixed(
                      3
                    )}
                    )
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Additional info */}
          <div className="border-t pt-4 space-y-2">
            {symbol.binance_ticker && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Binance:</span>
                <span className="text-xs">{symbol.binance_ticker}</span>
              </div>
            )}
            {symbol.cg_id && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  CoinGecko:
                </span>
                <span className="text-xs">{symbol.cg_id}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
