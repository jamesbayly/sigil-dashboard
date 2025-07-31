import { useSymbols } from "@/hooks/useSymbols";

interface SymbolMultiSelectProps {
  value: string[]; // array of symbol IDs as strings, or [] for all
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function SymbolMultiSelect({
  value,
  onChange,
  disabled,
}: SymbolMultiSelectProps) {
  const { symbols, isLoading } = useSymbols(false);

  return (
    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border rounded p-2">
      <label>
        <input
          type="checkbox"
          checked={value.length === 0}
          onChange={() => onChange([])}
          disabled={disabled || isLoading}
        />
        All symbols
      </label>
      {symbols.map((symbol) => (
        <label key={symbol.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.includes(symbol.id.toString())}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...value, symbol.id.toString()]);
              } else {
                onChange(value.filter((id) => id !== symbol.id.toString()));
              }
            }}
            disabled={disabled || isLoading}
          />
          {symbol.name} ({symbol.symbol})
        </label>
      ))}
    </div>
  );
}
