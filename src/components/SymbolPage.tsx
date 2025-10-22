import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { useSymbol } from "@/hooks/useSymbol";
import { SymbolType, type SymbolRequest } from "@/types";
import TradesTable from "./TradesTable";
import OptionsTable from "./OptionsTable";
import ParsedNewsList from "./ParsedNewsList";
import { useParsedNews } from "@/hooks/useParsedNews";
import { useSymbols } from "@/hooks/useSymbols";
import { getNumberStyling } from "@/lib/utils";

// Zod schema for symbol form
const symbolSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  symbol_type: z.nativeEnum(SymbolType),
  symbol: z.string().min(1, "Symbol is required").max(20),
  binance_ticker: z.string().max(20).optional(),
  cg_id: z.string().optional(),
});

type SymbolFormValues = z.infer<typeof symbolSchema>;

export default function SymbolPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const symbolId = id ? parseInt(id, 10) : undefined;
  const {
    symbol,
    create,
    update,
    isLoading: symbolLoading,
  } = useSymbol(symbolId);
  const { symbols } = useSymbols();
  const { parsedNews, isLoading: parsedNewsLoading } = useParsedNews(symbolId);

  const isEdit = !!id;

  const form = useForm<SymbolFormValues>({
    resolver: zodResolver(symbolSchema),
    defaultValues: {
      name: "",
      symbol_type: SymbolType.STOCK,
      symbol: "",
      binance_ticker: "",
      cg_id: "",
    },
  });

  const onSubmit = async (values: SymbolFormValues) => {
    try {
      const symbolData: SymbolRequest = {
        ...values,
        binance_ticker: values.binance_ticker || "",
        cg_id: values.cg_id || "",
      };

      let result;
      if (isEdit && symbol) {
        result = await update({ id: symbol.id, ...symbolData });
      } else {
        result = await create(symbolData);
      }

      if (result) {
        form.reset();
        navigate(`/symbols/${result.id}`);
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
        binance_ticker: symbol.binance_ticker,
        cg_id: symbol.cg_id,
      });
    } else if (!isEdit) {
      form.reset({
        name: "",
        symbol_type: SymbolType.STOCK,
        symbol: "",
        binance_ticker: "",
        cg_id: "",
      });
    }
  }, [symbol, form, isEdit]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Symbols
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit
              ? `Edit Symbol: ${
                  symbolLoading ? "Loading..." : symbol?.name || "Not Found"
                }`
              : "Create New Symbol"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update the symbol information below"
              : "Add a new symbol to the system"}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Main Form Card */}
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
                        <Input placeholder="Bitcoin" {...field} />
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
                          <Input placeholder="BTC" {...field} />
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
                          <Input placeholder="BTCUSDT" {...field} />
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
                        <Input placeholder="bitcoin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEdit ? "Update Symbol" : "Create Symbol"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Symbol Information Card (only show when editing) */}
        {symbol && (
          <Card>
            <CardHeader>
              <CardTitle>Current Symbol Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    Market Cap (M)
                  </div>
                  <div className="text-lg">
                    {symbol.market_cap?.toLocaleString() ?? "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    CG Rank
                  </div>
                  <div className="text-lg">{symbol.cg_rank ?? "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    24h Change
                  </div>
                  <div
                    className={`text-lg ${getNumberStyling(
                      symbol.day_change_percent
                    )}`}
                  >
                    {(symbol.day_change_percent || 0) > 0 ? "+" : ""}
                    {(symbol.day_change_percent || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    1h Change
                  </div>
                  <div
                    className={`text-lg ${getNumberStyling(
                      symbol.hour_change_percent
                    )}`}
                  >
                    {(symbol.hour_change_percent || 0) > 0 ? "+" : ""}
                    {(symbol.hour_change_percent || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    Data Points
                  </div>
                  <div className="text-lg">
                    {symbol.count_data.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    Symbol ID
                  </div>
                  <div className="text-lg">#{symbol.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    Earliest Date
                  </div>
                  <div className="text-lg">
                    {symbol.earliest_date
                      ? new Date(symbol.earliest_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-muted-foreground">
                    Latest Date
                  </div>
                  <div className="text-lg">
                    {symbol.latest_date
                      ? new Date(symbol.latest_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show trades table when editing existing symbol */}
        {isEdit && symbol && (
          <div className="mt-8">
            <TradesTable
              globalSymbolFilter={symbol.id}
              title={`Trades for ${symbol.name} (${symbol.symbol})`}
            />
          </div>
        )}

        {/* Show options table when editing existing STOCK symbol */}
        {isEdit && symbol && symbol.symbol_type === "STOCK" && (
          <>
            <div className="mt-8">
              <div className="w-full">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-2">Option Score</h2>
                  <div className="text-3xl font-bold">
                    <span className={getNumberStyling(symbol.option_score)}>
                      {symbol.option_score.toFixed(3) || "N/A"}
                    </span>
                    <span
                      className={getNumberStyling(
                        symbol.option_score - symbol.option_score_prev
                      )}
                    >
                      {symbol.option_score - symbol.option_score_prev > 0
                        ? " (Δ +"
                        : " (Δ "}
                      {(symbol.option_score - symbol.option_score_prev).toFixed(
                        3
                      ) || "N/A"}
                      {")"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <OptionsTable
                globalSymbolFilter={symbol.id}
                title={`Options for ${symbol.name} (${symbol.symbol})`}
                showUploadButton={false}
                showFilters={true}
              />
            </div>
          </>
        )}

        {/* Show parsed news when editing existing symbol */}
        {isEdit && symbol && !parsedNewsLoading && parsedNews.length > 0 && (
          <div className="mt-8">
            <ParsedNewsList
              parsedItems={parsedNews}
              symbols={symbols}
              title={`Parsed News for ${symbol.name} (${symbol.symbol})`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
