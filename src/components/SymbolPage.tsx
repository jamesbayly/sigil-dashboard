import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, X } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSymbol } from "@/hooks/useSymbol";
import {
  SymbolType,
  type SymbolPerformanceReturns,
  type SymbolRequest,
} from "@/types";
import TradesTable from "./TradesTable";
import ParsedNewsList from "./ParsedNewsList";
import { useParsedNews } from "@/hooks/useParsedNews";
import { useSymbols } from "@/hooks/useSymbols";
import { getNumberStyling } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import IndustryPopover from "./IndustryPopover";
import OptionsList from "./OptionsList";
import { useSymbolPerformance } from "../hooks/useSymbolPerformance";

// Zod schema for symbol form
const symbolSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  symbol_type: z.enum(SymbolType),
  symbol: z.string().min(1, "Symbol is required").max(20),
  binance_ticker: z.string().max(20).optional(),
  cg_id: z.string().optional(),
  description: z.string().optional(),
});

type SymbolFormValues = z.infer<typeof symbolSchema>;

const PERFORMANCE_HORIZONS: (keyof SymbolPerformanceReturns)[] = [
  "1d",
  "5d",
  "1m",
  "3m",
  "6m",
  "12m",
];

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

export default function SymbolPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const symbolId = id ? parseInt(id, 10) : undefined;
  const {
    symbol,
    create,
    update,
    isLoading: symbolLoading,
  } = useSymbol(symbolId);
  const { symbols } = useSymbols();

  const existingSymbol = !!id;
  const [isEditMode, setIsEditMode] = useState(!existingSymbol); // For new symbols, always in edit mode

  // Memoize industry IDs to prevent unnecessary re-renders
  const industryIds = useMemo(
    () => symbol?.industry_tags?.map((tag) => tag.id),
    [symbol?.industry_tags],
  );

  const { parsedNews, isLoading: parsedNewsLoading } = useParsedNews(
    symbol ? symbolId : undefined,
    undefined,
    industryIds,
  );

  const {
    performance,
    isLoading: performanceLoading,
    error: performanceError,
  } = useSymbolPerformance(
    symbol?.symbol_type === SymbolType.STOCK ? symbol.id : undefined,
  );

  const stockTrendData = useMemo(
    () =>
      performance?.daily_ohlcv_1y.map((point) => ({
        date: new Date(point.date),
        close: point.c,
      })) ?? [],
    [performance?.daily_ohlcv_1y],
  );

  const form = useForm<SymbolFormValues>({
    resolver: zodResolver(symbolSchema),
    defaultValues: {
      name: "",
      symbol_type: SymbolType.STOCK,
      symbol: "",
      binance_ticker: undefined,
      cg_id: undefined,
      description: "",
    },
  });

  const onSubmit = async (values: SymbolFormValues) => {
    try {
      const symbolData: SymbolRequest = {
        ...values,
        binance_ticker: values.binance_ticker || "",
        cg_id: values.cg_id || "",
        description: values.description || "",
        industry_tags: symbol?.industry_tags || [],
      };

      let result;
      if (existingSymbol && symbol) {
        result = await update({ id: symbol.id, ...symbolData });
        if (result) {
          setIsEditMode(false); // Exit edit mode after successful update
        }
      } else {
        result = await create(symbolData);
        if (result) {
          form.reset();
          navigate(`/symbols/${result.id}`);
        }
      }
    } catch (error) {
      console.error("Failed to save symbol:", error);
    }
  };

  const handleCancel = () => {
    navigate("/symbols");
  };

  // Reset form when symbol changes
  useEffect(() => {
    if (symbol) {
      form.reset({
        name: symbol.name,
        symbol_type: symbol.symbol_type,
        symbol: symbol.symbol,
        binance_ticker: symbol.binance_ticker || undefined,
        cg_id: symbol.cg_id || undefined,
        description: symbol.description || "",
      });
    } else if (!existingSymbol) {
      form.reset({
        name: "",
        symbol_type: SymbolType.STOCK,
        symbol: "",
        binance_ticker: "",
        cg_id: "",
        description: "",
      });
    }
  }, [symbol, form, existingSymbol]);

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Symbols
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">
          {existingSymbol
            ? `${symbolLoading ? "Loading..." : symbol?.name + " (" + symbol?.symbol + ")" || "Not Found"}`
            : "Create New Symbol"}
        </h1>
        {isAuthenticated && existingSymbol && (
          <Button
            variant={isEditMode ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2"
          >
            {isEditMode ? (
              <>
                <X className="h-4 w-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit Symbol
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tabs for existing symbols */}
      {existingSymbol && symbol ? (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList
            className={`grid w-full ${symbol.symbol_type === "STOCK" ? "grid-cols-5" : "grid-cols-3"}`}
          >
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {symbol.symbol_type === "STOCK" && (
              <TabsTrigger value="options">Options</TabsTrigger>
            )}
            {symbol.symbol_type === "STOCK" && (
              <TabsTrigger value="stock-performance">
                Stock Performance
              </TabsTrigger>
            )}
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Symbol Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bitcoin"
                              {...field}
                              disabled={!isEditMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditMode ? (
                      <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <textarea
                                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                                placeholder="Enter symbol description..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      symbol?.description && (
                        <div className="space-y-2">
                          <FormLabel>Description</FormLabel>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {symbol.description}
                          </p>
                        </div>
                      )
                    )}
                    <FormField
                      name="symbol_type"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!isEditMode}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select symbol type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CRYPTO">Crypto</SelectItem>
                                <SelectItem value="STOCK">Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name="symbol"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="BTC"
                                {...field}
                                disabled={!isEditMode}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="binance_ticker"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Binance Ticker</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="BTCUSDT"
                                {...field}
                                disabled={!isEditMode}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      name="cg_id"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CoinGecko ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="bitcoin"
                              {...field}
                              disabled={!isEditMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Industry Tags */}
                    {existingSymbol && symbol && (
                      <div className="space-y-2">
                        <FormLabel>Industry Tags</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {symbol.industry_tags?.length > 0 ? (
                            symbol.industry_tags.map((tag) => (
                              <IndustryPopover key={tag.id} industry={tag} />
                            ))
                          ) : (
                            <p className="text-xs">No industry tags found.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {isEditMode && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (existingSymbol) {
                              setIsEditMode(false);
                              // Reset form to original values
                              if (symbol) {
                                form.reset({
                                  name: symbol.name,
                                  symbol_type: symbol.symbol_type,
                                  symbol: symbol.symbol,
                                  binance_ticker: symbol.binance_ticker,
                                  cg_id: symbol.cg_id,
                                  description: symbol.description,
                                });
                              }
                            } else {
                              handleCancel();
                            }
                          }}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">
                          {existingSymbol ? "Update Symbol" : "Create Symbol"}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Current Symbol Information */}
            <Card>
              <CardHeader>
                <CardTitle>Current Symbol Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground text-xs sm:text-sm">
                      Market Cap (M)
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      {symbol.market_cap?.toLocaleString() ?? "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground text-xs sm:text-sm">
                      CG Rank
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      {symbol.cg_rank ?? "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground text-xs sm:text-sm">
                      Data Points
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      {symbol.count_data.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground text-xs sm:text-sm">
                      Symbol ID
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      #{symbol.id}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground text-xs sm:text-sm">
                      Earliest Date
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      {symbol.earliest_date
                        ? new Date(symbol.earliest_date).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground text-xs sm:text-sm">
                      Latest Date
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      {symbol.latest_date
                        ? new Date(symbol.latest_date).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">
                      1h Change %
                    </div>
                    <div
                      className={`text-lg font-mono ${getNumberStyling(
                        symbol.hour_change_percent,
                      )}`}
                    >
                      {(symbol.hour_change_percent || 0) > 0 ? "+" : ""}
                      {symbol.hour_change_percent
                        ? symbol.hour_change_percent.toFixed(2) + "%"
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">
                      24h Change %
                    </div>
                    <div
                      className={`text-lg font-mono ${getNumberStyling(
                        symbol.day_change_percent,
                      )}`}
                    >
                      {(symbol.day_change_percent || 0) > 0 ? "+" : ""}
                      {symbol.day_change_percent
                        ? symbol.day_change_percent.toFixed(2) + "%"
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">
                      7d Change %
                    </div>
                    <div
                      className={`text-lg font-mono ${getNumberStyling(
                        symbol.week_change_percent,
                      )}`}
                    >
                      {(symbol.week_change_percent || 0) > 0 ? "+" : ""}
                      {symbol.week_change_percent
                        ? symbol.week_change_percent.toFixed(2) + "%"
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">
                      30d Change %
                    </div>
                    <div
                      className={`text-lg font-mono ${getNumberStyling(
                        symbol.month_change_percent,
                      )}`}
                    >
                      {(symbol.month_change_percent || 0) > 0 ? "+" : ""}
                      {symbol.month_change_percent
                        ? symbol.month_change_percent.toFixed(2) + "%"
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades" className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              Trades for {symbol.name} ({symbol.symbol})
            </h2>
            <TradesTable globalSymbolFilter={symbol.id} title="" />
          </TabsContent>

          {/* Options Tab */}
          {symbol.symbol_type === "STOCK" && (
            <TabsContent value="options">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      Option Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <div className="text-2xl sm:text-3xl font-bold">
                        <span className={getNumberStyling(symbol.option_score)}>
                          {symbol.option_score.toFixed(3) || "N/A"}
                        </span>
                      </div>
                      <div
                        className={`text-lg sm:text-xl font-semibold ${getNumberStyling(
                          symbol.option_score - symbol.option_score_prev,
                        )}`}
                      >
                        {symbol.option_score - symbol.option_score_prev > 0
                          ? "(Δ +"
                          : "(Δ "}
                        {(
                          symbol.option_score - symbol.option_score_prev
                        ).toFixed(3) || "N/A"}
                        {")"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      Options for {symbol.name} ({symbol.symbol})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OptionsList symbolId={symbol.id} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {symbol.symbol_type === "STOCK" && (
            <TabsContent value="stock-performance" className="space-y-4">
              {performanceLoading ? (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-sm text-muted-foreground">
                      Loading stock performance...
                    </p>
                  </CardContent>
                </Card>
              ) : performanceError ? (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-sm text-red-600">
                      {performanceError.message}
                    </p>
                  </CardContent>
                </Card>
              ) : performance ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        1Y Close Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stockTrendData.length > 1 ? (
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={stockTrendData}
                              margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis
                                dataKey="date"
                                minTickGap={32}
                                tickFormatter={(value: Date) =>
                                  new Date(value).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })
                                }
                              />
                              <YAxis
                                width={64}
                                domain={["auto", "auto"]}
                                tickFormatter={(value: number) => value.toFixed(2)}
                              />
                              <Tooltip
                                labelFormatter={(value: Date) =>
                                  new Date(value).toLocaleDateString()
                                }
                                formatter={(value: number | string) =>
                                  typeof value === "number"
                                    ? value.toFixed(2)
                                    : value
                                }
                              />
                              <Line
                                type="monotone"
                                dataKey="close"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not enough OHLCV data to render trend chart.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        Returns %
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {PERFORMANCE_HORIZONS.map((horizon) => {
                          const value = performance.returns_percent[horizon];
                          return (
                            <div
                              key={horizon}
                              className="p-3 bg-muted rounded space-y-1"
                            >
                              <div className="text-xs text-muted-foreground uppercase">
                                {horizon}
                              </div>
                              <div
                                className={`text-base font-mono ${getNumberStyling(
                                  value ?? undefined,
                                )}`}
                              >
                                {formatPercent(value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Indicators</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <div className="text-muted-foreground">
                              Latest Close
                            </div>
                            <div className="font-mono font-semibold">
                              {performance.latest_close.toFixed(2)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">
                              VWAP 20D
                            </div>
                            <div className="font-mono font-semibold">
                              {performance.indicators.vwap_20d?.toFixed(2) ??
                                "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">ATR 14</div>
                            <div className="font-mono font-semibold">
                              {performance.indicators.atr_14?.toFixed(2) ??
                                "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">
                              Volume Ratio 20D
                            </div>
                            <div className="font-mono font-semibold">
                              {performance.indicators.volume_ratio_20d?.toFixed(
                                2,
                              ) ?? "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">SMA 20</div>
                            <div className="font-mono font-semibold">
                              {performance.indicators.moving_averages.sma_20?.toFixed(
                                2,
                              ) ?? "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">SMA 50</div>
                            <div className="font-mono font-semibold">
                              {performance.indicators.moving_averages.sma_50?.toFixed(
                                2,
                              ) ?? "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">SMA 200</div>
                            <div className="font-mono font-semibold">
                              {performance.indicators.moving_averages.sma_200?.toFixed(
                                2,
                              ) ?? "N/A"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Breakout</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="space-y-1">
                            <div className="text-muted-foreground">
                              Breakout Level
                            </div>
                            <div className="font-mono font-semibold">
                              {performance.breakout.breakout_level?.toFixed(
                                2,
                              ) ?? "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">
                              Days Since Breakout
                            </div>
                            <div className="font-mono font-semibold">
                              {performance.breakout.days_since_breakout ??
                                "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">
                              % Above Breakout
                            </div>
                            <div
                              className={`font-mono font-semibold ${getNumberStyling(
                                performance.breakout.percent_above_level ??
                                  undefined,
                              )}`}
                            >
                              {formatPercent(
                                performance.breakout.percent_above_level,
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        Relative Strength (% points)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {performance.relative_strength_percent_points
                        .industry_context && (
                        <p className="text-sm text-muted-foreground">
                          Industry:{" "}
                          {
                            performance.relative_strength_percent_points
                              .industry_context.name
                          }
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            label: "vs SPY",
                            values:
                              performance.relative_strength_percent_points
                                .vs_spy,
                          },
                          {
                            label: "vs QQQ",
                            values:
                              performance.relative_strength_percent_points
                                .vs_qqq,
                          },
                          {
                            label: "vs Industry",
                            values:
                              performance.relative_strength_percent_points
                                .vs_industry,
                          },
                        ].map((series) => (
                          <div
                            key={series.label}
                            className="border rounded p-3 space-y-2"
                          >
                            <div className="font-medium text-sm">
                              {series.label}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {PERFORMANCE_HORIZONS.map((horizon) => {
                                const value = series.values?.[horizon];
                                return (
                                  <div key={horizon} className="space-y-1">
                                    <div className="text-muted-foreground uppercase">
                                      {horizon}
                                    </div>
                                    <div
                                      className={`font-mono ${getNumberStyling(
                                        value ?? undefined,
                                      )}`}
                                    >
                                      {formatPercent(value)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Data availability:{" "}
                        {performance.data_availability.daily_points} daily
                        points (
                        {performance.data_availability.has_1y_daily
                          ? "1Y complete"
                          : "1Y partial"}
                        )
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        Recent Daily OHLCV
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-2 pr-3">Date</th>
                              <th className="py-2 pr-3">Open</th>
                              <th className="py-2 pr-3">High</th>
                              <th className="py-2 pr-3">Low</th>
                              <th className="py-2 pr-3">Close</th>
                              <th className="py-2">Volume</th>
                            </tr>
                          </thead>
                          <tbody>
                            {performance.daily_ohlcv_1y
                              .slice(-10)
                              .reverse()
                              .map((row) => (
                                <tr
                                  key={new Date(row.date).toISOString()}
                                  className="border-b"
                                >
                                  <td className="py-2 pr-3">
                                    {new Date(row.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-2 pr-3 font-mono">
                                    {row.o.toFixed(2)}
                                  </td>
                                  <td className="py-2 pr-3 font-mono">
                                    {row.h.toFixed(2)}
                                  </td>
                                  <td className="py-2 pr-3 font-mono">
                                    {row.l.toFixed(2)}
                                  </td>
                                  <td className="py-2 pr-3 font-mono">
                                    {row.c.toFixed(2)}
                                  </td>
                                  <td className="py-2 font-mono">
                                    {row.v.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-sm text-muted-foreground">
                      No stock performance data available yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            {!parsedNewsLoading && parsedNews && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Parsed News for {symbol.name} ({symbol.symbol})
                </h2>
                {parsedNews.length > 0 ? (
                  <ParsedNewsList
                    parsedItems={parsedNews}
                    symbols={symbols}
                    title=""
                  />
                ) : (
                  <p>No parsed news items found.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {/* Main Form Card for creating new symbol */}
          <Card>
            <CardHeader>
              <CardTitle>Symbol Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bitcoin"
                            {...field}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                            placeholder="Enter symbol description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="symbol_type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!isEditMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select symbol type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CRYPTO">Crypto</SelectItem>
                              <SelectItem value="STOCK">Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="symbol"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="BTC"
                              {...field}
                              disabled={!isEditMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="binance_ticker"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Binance Ticker</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="BTCUSDT"
                              {...field}
                              disabled={!isEditMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="cg_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CoinGecko ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="bitcoin"
                            {...field}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditMode && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto">
                        Create Symbol
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
