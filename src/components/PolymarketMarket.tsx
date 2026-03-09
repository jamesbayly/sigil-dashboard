import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolymarketMarket } from "@/hooks/usePolymarketMarket";
import { Badge } from "./ui/badge";
import type { PolymarketPriceResponse, PolymarketTradeResponse } from "@/types";
import { useState, useEffect } from "react";
import { exportCSV, getNumberStyling } from "@/lib/utils";
import { getAllPolymarketPrices } from "@/utils/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function PolymarketMarket() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const marketId = id ? parseInt(id, 10) : undefined;
  const { marketInfo, isLoading } = usePolymarketMarket(marketId);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [priceHistory, setPriceHistory] = useState<
    { date: string; yes_price: number; no_price: number }[]
  >([]);
  const [priceLoading, setPriceLoading] = useState(false);

  const handleBack = () => {
    navigate("/polymarket");
  };

  // Fetch price history for this market
  useEffect(() => {
    if (!marketId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPriceHistory([]);
      return;
    }
    setPriceLoading(true);
    getAllPolymarketPrices(marketId)
      .then((prices) => {
        if (!Array.isArray(prices)) {
          setPriceHistory([]);
          return;
        }
        // Sort by date ascending
        // Map to chart format
        const chartData = prices.map((p: PolymarketPriceResponse) => ({
          date: new Date(p.date).toISOString(),
          yes_price: p.outcome_price,
          no_price: 1 - p.outcome_price,
        }));
        setPriceHistory(chartData);
      })
      .finally(() => setPriceLoading(false));
  }, [marketId]);

  const getMarketURL = () =>
    marketInfo && marketInfo.slug
      ? `https://polymarket.com/event/${marketInfo.slug}`
      : "#";

  const exportData = () => {
    if (!marketInfo) return;

    exportCSV(
      `market_${marketInfo.id}_trades`,
      "market_id,trade_id,transaction_hash,trade_date,user_id,user_name,user_trade_count,side,outcome,amount,price,current_price,current_profit,current_profit_percent",
      marketInfo.significant_trades.map((trade) => [
        marketInfo.id,
        trade.id,
        trade.transaction_hash,
        trade.trade_date,
        trade.user_id,
        trade.user_name ?? "",
        trade.user_trade_count,
        trade.side,
        trade.outcome,
        trade.amount,
        trade.price,
        trade.current_price ?? "",
        trade.current_profit ?? "",
        trade.current_profit_percent ?? "",
      ]),
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading market details...</div>
      </div>
    );
  }

  if (!marketInfo) {
    return (
      <div className="space-y-6">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Button>
        <div className="text-center py-8 text-red-600">Market not found</div>
      </div>
    );
  }

  const statusColor =
    marketInfo.status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : marketInfo.status === "closed"
        ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";

  return (
    <div className="space-y-6">
      <Button onClick={handleBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Markets
      </Button>

      {/* Market Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 flex items-center">
                {marketInfo.title}
                <Link
                  to={getMarketURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColor} variant="outline">
                  {marketInfo.status}
                </Badge>
                {marketInfo.category && (
                  <Badge variant="outline" className="capitalize">
                    {marketInfo.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">
              Description
            </h3>
            <p className="text-sm">
              {isDescriptionExpanded
                ? marketInfo.description
                : `${marketInfo.description.slice(0, 200)}${
                    marketInfo.description.length > 200 ? "..." : ""
                  }`}
            </p>
            {marketInfo.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 h-8 px-2"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Show More
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          {priceLoading ? (
            <div className="text-center py-8">Loading price history...</div>
          ) : priceHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No price history found for this market
            </div>
          ) : (
            <div className="h-64 bg-white dark:bg-gray-800 p-2 sm:p-4 rounded">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => tick.slice(0, 10)}
                  />
                  <YAxis max={1} min={0} />
                  <Tooltip />
                  <Line
                    label="Yes"
                    type="monotone"
                    dataKey="yes_price"
                    stroke="#3b82f6"
                    dot={false}
                  />
                  <Line
                    label="No"
                    type="monotone"
                    dataKey="no_price"
                    stroke="#ef4444"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Significant Trades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row flex-wrap justify-between">
            Significant Trades ({marketInfo.significant_trades.length})
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="ml-4 h-8 px-2"
            >
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketInfo.significant_trades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No significant trades found for this market
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {marketInfo.significant_trades.map((trade) => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Market Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Polymarket Market ID
              </h3>
              <p className="font-mono text-xs break-all">
                {marketInfo.polymarket_market_id}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Condition ID
              </h3>
              <p className="font-mono text-xs break-all">
                {marketInfo.polymarket_condition_id}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Slug
              </h3>
              <p className="text-sm">{marketInfo.slug}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Insider Trading Score
              </h3>
              <p className="font-mono text-lg font-semibold">
                {marketInfo.insider_trading_score.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Significant Trades Count
              </h3>
              <p className="font-semibold text-lg">
                {marketInfo.significant_trades_count}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Created At
              </h3>
              <p className="text-sm">
                {new Date(marketInfo.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Start Date
              </h3>
              <p className="text-sm">
                {new Date(marketInfo.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Resolution Date
              </h3>
              <p className="text-sm">
                {marketInfo.resolution_date
                  ? new Date(marketInfo.resolution_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TradeCard({ trade }: { trade: PolymarketTradeResponse }) {
  const explorerUrl = `https://polygonscan.com/tx/${trade.transaction_hash}`;
  const walletUrl = `https://polygonscan.com/address/${trade.user_id}`;
  const polyMarketUserUrl = trade.user_name
    ? `https://polymarket.com/@${trade.user_name}`
    : undefined;

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Transaction Hash
            </h4>
            <div className="flex items-center gap-2">
              <p
                className="font-mono text-xs truncate"
                title={trade.transaction_hash}
              >
                {trade.transaction_hash.slice(0, 10)}...
                {trade.transaction_hash.slice(-8)}
              </p>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              User
            </h4>
            <div className="text-xs flex flex-wrap items-center gap-1">
              {trade.user_name ? (
                <>
                  <span className="font-mono">{trade.user_name}</span>
                  <a
                    href={polyMarketUserUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : (
                <>
                  <span className="font-mono">{trade.user_id}</span>
                  <a
                    href={walletUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}{" "}
              with {trade.user_trade_count} trades
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Outcome
            </h4>
            <Badge
              variant="outline"
              className={
                trade.side === "BUY"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }
            >
              {trade.side}
            </Badge>{" "}
            <Badge
              variant="outline"
              className={
                trade.outcome.toLowerCase() === "yes"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : trade.outcome.toLowerCase() === "no"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : ""
              }
            >
              {trade.outcome.toUpperCase()}
            </Badge>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Amount and Price
            </h4>
            <p className="font-mono font-semibold">
              $
              {trade.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              at ${trade.price}
            </p>
          </div>
          {trade.current_price !== undefined && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                PNL (current price: $
                {trade.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                )
              </h4>
              <p
                className={`font-mono font-semibold ${getNumberStyling(trade.current_profit)}`}
              >
                $
                {(trade.current_profit ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ({trade.current_profit_percent?.toFixed(2)}%)
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Trade Date
            </h4>
            <p>Local: {new Date(trade.trade_date).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              UTC: {new Date(trade.trade_date).toUTCString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
