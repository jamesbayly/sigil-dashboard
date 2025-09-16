import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import type { OptionsDataRequest } from "@/types";

interface OptionsUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createOptions: (
    data: OptionsDataRequest[]
  ) => Promise<{ success: boolean; message: string }>;
  isCreating: boolean;
}

interface ParsedOptionsData extends OptionsDataRequest {
  rowIndex: number;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export default function OptionsUploadModal({
  open,
  onOpenChange,
  createOptions,
  isCreating,
}: OptionsUploadModalProps) {
  const [parsedData, setParsedData] = useState<ParsedOptionsData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedColumns = [
    "symbol_id",
    "trade_date",
    "expiration_date",
    "order_type",
    "strike",
    "strike_delta",
    "premium",
    "price_at_buy",
  ];

  const resetModal = () => {
    setParsedData([]);
    setValidationErrors([]);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      parseCSV(selectedFile);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const parseCSV = async (file: File) => {
    setIsProcessing(true);
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      setValidationErrors([
        { row: 0, column: "file", message: "File is empty" },
      ]);
      setIsProcessing(false);
      return;
    }

    const errors: ValidationError[] = [];
    const data: ParsedOptionsData[] = [];

    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsProcessing(false);
      return;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values[0] === "") {
        // Skip empty symbol_id rows
        continue;
      }

      if (values.length !== expectedColumns.length) {
        console.error("line:", lines[i]);
        console.log("Values length:", values);
        errors.push({
          row: i,
          column: "row",
          message: `Expected ${expectedColumns.length} columns but found ${values.length}`,
        });
        continue;
      }

      const rowData: Partial<ParsedOptionsData> = { rowIndex: i };

      // Parse and validate symbol_id
      const symbolId = parseInt(values[0]);
      if (isNaN(symbolId)) {
        errors.push({
          row: i,
          column: "symbol_id",
          message: "Must be a valid number",
        });
      } else {
        rowData.symbol_id = symbolId;
      }

      // Validate trade_date
      const tradeDateStr = values[1].trim();
      const tradeDate = new Date(tradeDateStr + "T00:00:00.000Z"); // Force UTC
      if (isNaN(tradeDate.getTime())) {
        errors.push({
          row: i,
          column: "trade_date",
          message: "Must be a valid date (YYYY-MM-DD format expected)",
        });
      } else {
        rowData.trade_date = tradeDate;
      }

      // Validate expiration_date
      const expirationDateStr = values[2].trim();
      const expirationDate = new Date(expirationDateStr + "T00:00:00.000Z"); // Force UTC
      if (isNaN(expirationDate.getTime())) {
        errors.push({
          row: i,
          column: "expiration_date",
          message: "Must be a valid date (YYYY-MM-DD format expected)",
        });
      } else {
        rowData.expiration_date = expirationDate;
      }

      // Validate order_type
      const orderType = values[3] as
        | "CALL_BUY"
        | "CALL_SELL"
        | "PUT_BUY"
        | "PUT_SELL";
      if (
        !["CALL_BUY", "CALL_SELL", "PUT_BUY", "PUT_SELL"].includes(orderType)
      ) {
        errors.push({
          row: i,
          column: "order_type",
          message: "Must be one of: CALL_BUY, CALL_SELL, PUT_BUY, PUT_SELL",
        });
      } else {
        rowData.type = orderType;
      }

      // Parse and validate strike
      const strike = parseFloat(values[4]);
      if (isNaN(strike) || strike <= 0) {
        errors.push({
          row: i,
          column: "strike",
          message: "Must be a positive number",
        });
      } else {
        rowData.strike_price = strike;
      }

      // Parse and validate strike_delta
      const strikeDelta = parseFloat(values[5]);
      if (isNaN(strikeDelta)) {
        errors.push({
          row: i,
          column: "strike_delta",
          message: "Must be a valid number",
        });
      } else {
        rowData.strike_delta_percent = strikeDelta;
      }

      // Parse and validate premium
      const premium = parseFloat(values[6]);
      if (isNaN(premium) || premium <= 0) {
        errors.push({
          row: i,
          column: "premium",
          message: "Must be a positive number",
        });
      } else {
        rowData.premium = premium;
      }

      // Parse and validate price_at_buy
      const priceAtBuy = parseFloat(values[7]);
      if (isNaN(priceAtBuy) || priceAtBuy <= 0) {
        errors.push({
          row: i,
          column: "price_at_buy",
          message: "Must be a positive number",
        });
      } else {
        rowData.asset_price = priceAtBuy;
      }

      if (Object.keys(rowData).length === 9) {
        // All fields plus rowIndex
        data.push(rowData as ParsedOptionsData);
      }
    }

    setValidationErrors(errors);
    setParsedData(data);
    setIsProcessing(false);
  };

  const previewColumns: ColumnDef<ParsedOptionsData>[] = [
    {
      accessorKey: "rowIndex",
      header: "Row",
      cell: ({ row }) => row.original.rowIndex,
    },
    {
      accessorKey: "symbol_id",
      header: "Symbol ID",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type?.replace("_", " ")}</Badge>
      ),
    },
    {
      accessorKey: "trade_date",
      header: "Trade Date",
      cell: ({ row }) =>
        row.original.trade_date
          ? new Date(row.original.trade_date).toLocaleDateString()
          : "",
    },
    {
      accessorKey: "expiration_date",
      header: "Expiration Date",
      cell: ({ row }) =>
        row.original.expiration_date
          ? new Date(row.original.expiration_date).toLocaleDateString()
          : "",
    },
    {
      accessorKey: "strike_price",
      header: "Strike Price",
      cell: ({ row }) =>
        `$${row.original.strike_price?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "strike_delta_percent",
      header: "Strike Delta %",
      cell: ({ row }) => `${row.original.strike_delta_percent?.toFixed(2)}%`,
    },
    {
      accessorKey: "premium",
      header: "Premium",
      cell: ({ row }) =>
        `$${row.original.premium?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "asset_price",
      header: "Asset Price",
      cell: ({ row }) =>
        `$${row.original.asset_price?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];

  const handleConfirm = async () => {
    if (parsedData.length > 0) {
      const finalData: OptionsDataRequest[] = parsedData.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ rowIndex, ...rest }) => {
          const item = rest as OptionsDataRequest;
          // Ensure dates are sent as UTC ISO strings (date-only)
          return {
            ...item,
            trade_date: new Date(
              item.trade_date.toISOString().split("T")[0] + "T00:00:00.000Z"
            ),
            expiration_date: new Date(
              item.expiration_date.toISOString().split("T")[0] +
                "T00:00:00.000Z"
            ),
          };
        }
      );

      const result = await createOptions(finalData);

      if (result.success) {
        onOpenChange(false);
        resetModal();
      }
      // Error handling is done in the hook with toast notifications
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Options Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with options data for today&apos;s date. The file
            should contain the following columns in order:{" "}
            {expectedColumns.join(", ")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Select CSV File
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="flex-1"
                disabled={isCreating}
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Creating State */}
          {isCreating && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Creating options data...
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Processing CSV file...
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">
                  Validation Errors ({validationErrors.length})
                </span>
              </div>
              <div className="max-h-40 overflow-auto bg-red-50 border border-red-200 rounded-md p-3">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    Row {error.row}, Column &quot;{error.column}&quot;:{" "}
                    {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State and Preview */}
          {parsedData.length > 0 && validationErrors.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">
                  Successfully parsed {parsedData.length} records
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview Data</h3>
                <div className="border rounded-md overflow-auto max-h-80">
                  <DataTable data={parsedData} columns={previewColumns} />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              parsedData.length === 0 ||
              validationErrors.length > 0 ||
              isCreating
            }
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              `Confirm & Import (${parsedData.length} records)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
