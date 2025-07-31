import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SymbolResponse, SymbolRequest } from "@/types";

// Zod schema for symbol form
const symbolSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  symbol_type: z.enum(["CRYPTO", "STOCK"]),
  symbol: z.string().min(1, "Symbol is required").max(20),
  binance_ticker: z.string().max(20).optional(),
  cg_id: z.string().optional(),
});

type SymbolFormValues = z.infer<typeof symbolSchema>;

interface SymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SymbolRequest) => Promise<void>;
  symbol?: SymbolResponse | null;
}

export default function SymbolModal({
  isOpen,
  onClose,
  onSave,
  symbol,
}: SymbolModalProps) {
  const isEdit = !!symbol;

  const form = useForm<SymbolFormValues>({
    resolver: zodResolver(symbolSchema),
    defaultValues: {
      name: "",
      symbol_type: "CRYPTO",
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
      await onSave(symbolData);
      form.reset();
    } catch (error) {
      console.error("Failed to save symbol:", error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

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
    } else {
      form.reset({
        name: "",
        symbol_type: "CRYPTO",
        symbol: "",
        binance_ticker: "",
        cg_id: "",
      });
    }
  }, [symbol, form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit Symbol: ${symbol?.name}` : "Create New Symbol"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="grid grid-cols-2 gap-4">
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

            {symbol && (
              <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Market Cap (M):</strong>{" "}
                    {symbol.market_cap?.toLocaleString() ?? "N/A"}
                  </div>
                  <div>
                    <strong>CG Rank:</strong> {symbol.cg_rank ?? "N/A"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>24h Change:</strong>{" "}
                    <span
                      className={
                        symbol.day_change_percent >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {(symbol.day_change_percent || 0) > 0 ? "+" : ""}
                      {(symbol.day_change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <strong>1h Change:</strong>{" "}
                    <span
                      className={
                        symbol.hour_change_percent >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {(symbol.hour_change_percent || 0) > 0 ? "+" : ""}
                      {(symbol.hour_change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Data Points:</strong>{" "}
                    {symbol.count_data.toLocaleString()}
                  </div>
                  <div>
                    <strong>ID:</strong> #{symbol.id}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Earliest Date:</strong>{" "}
                    {symbol.earliest_date
                      ? new Date(symbol.earliest_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Latest Date:</strong>{" "}
                    {symbol.latest_date
                      ? new Date(symbol.latest_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Update Symbol" : "Create Symbol"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
