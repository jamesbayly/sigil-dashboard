import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolymarketMarket } from "@/hooks/usePolymarketMarket";
import { Badge } from "./ui/badge";
import { PolymarketTradeResponse } from "@/types";
import { useState } from "react";

export default function PolymarketMarket() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const marketId = id ? parseInt(id, 10) : undefined;
  const { marketInfo, marketTrades, isLoading } = usePolymarketMarket(marketId);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleBack = () => {
    navigate("/polymarket");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading market details...</div>
      </div>
    );
  }

  if (!marketInfo || !marketTrades) {
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
              <CardTitle className="text-2xl mb-2">
                {marketInfo.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColor} variant="outline">
                  {marketInfo.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {marketInfo.category}
                </Badge>
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

      {/* Significant Trades */}
      <Card>
        <CardHeader>
          <CardTitle>
            Significant Trades ({marketTrades.significant_trades.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketTrades.significant_trades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No significant trades found for this market
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {marketTrades.significant_trades.map((trade) => (
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
                {new Date(marketInfo.resolution_date).toLocaleDateString()}
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
            <p className="text-xs" title={trade.user_id}>
              <span className="font-mono">{trade.user_id}</span> with{" "}
              {trade.user_trade_count} trades
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Outcome
            </h4>
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
              {trade.outcome}
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

          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Trade Date
            </h4>
            <p>{new Date(trade.trade_date).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
