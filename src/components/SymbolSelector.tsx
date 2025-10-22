import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSymbols } from "@/hooks/useSymbols";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [open, setOpen] = useState(false);

  const filteredSymbols =
    filterType === "STOCK"
      ? symbols.filter((s) => s.symbol_type === "STOCK")
      : symbols;

  const sortedSymbols = filteredSymbols.sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );

  const selectedSymbol = symbols.find((s) => s.id === value);
  const displayValue = selectedSymbol
    ? showName
      ? `${selectedSymbol.symbol} - ${selectedSymbol.name.slice(0, 30)}`
      : selectedSymbol.symbol
    : showName
    ? "All Symbols"
    : "All";

  return (
    <div>
      {showLabel && <Label>Symbol</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between",
              className,
              disabled && "opacity-60 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("p-0", className)}>
          <Command>
            <CommandInput placeholder="Search symbol or name..." />
            <CommandList>
              <CommandEmpty>No symbol found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === undefined ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {showName ? "All Symbols" : "All"}
                </CommandItem>
                {sortedSymbols.map((symbol) => {
                  const searchValue = showName
                    ? `${symbol.symbol} ${symbol.name}`
                    : symbol.symbol;
                  const displayText = showName
                    ? `${symbol.symbol} - ${symbol.name.slice(0, 30)}`
                    : symbol.symbol;

                  return (
                    <CommandItem
                      key={symbol.id}
                      value={searchValue}
                      onSelect={() => {
                        onChange(symbol.id === value ? undefined : symbol.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === symbol.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {displayText}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
