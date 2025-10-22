import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSymbols } from "@/hooks/useSymbols";
import { cn } from "@/lib/utils";

interface SymbolSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
  filterType?: "STOCK" | "ALL";
  showName?: boolean;
}

export default function SymbolSelector({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  className = "w-40",
  filterType = "ALL",
  showName = false,
}: SymbolSelectorProps) {
  const { symbols } = useSymbols();

  const filteredSymbols =
    filterType === "STOCK"
      ? symbols.filter((s) => s.symbol_type === "STOCK")
      : symbols;

  const handleValueChange = (v: string) => {
    onChange(v === "all" ? undefined : Number(v));
  };

  const selectedSymbol = symbols.find((s) => s.id === value);
  const displayValue = selectedSymbol
    ? showName
      ? `${selectedSymbol.symbol} - ${selectedSymbol.name.slice(0, 30)}`
      : selectedSymbol.symbol
    : "All";

  return (
    <div>
      {showLabel && <Label>Symbol</Label>}
      <Select
        onValueChange={handleValueChange}
        value={value?.toString() ?? "all"}
        disabled={disabled}
      >
        <SelectTrigger className={cn(className, disabled && "opacity-60")}>
          <SelectValue>{displayValue}</SelectValue>
        </SelectTrigger>
        {!disabled && (
          <SelectContent>
            <SelectItem value="all">
              {showName ? "All Symbols" : "All"}
            </SelectItem>
            {filteredSymbols
              .sort((a, b) => a.symbol.localeCompare(b.symbol))
              .map((symbol) => (
                <SelectItem key={symbol.id} value={symbol.id.toString()}>
                  {showName
                    ? `${symbol.symbol} - ${symbol.name.slice(0, 30)}`
                    : symbol.symbol}
                </SelectItem>
              ))}
          </SelectContent>
        )}
      </Select>
    </div>
  );
}
