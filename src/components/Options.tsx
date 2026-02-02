import { useState } from "react";
import { useOptionsData } from "@/hooks/useOptionsData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Sparkles } from "lucide-react";
import OptionsTable from "./OptionsTable";
import OptionsUploadModal from "./OptionsUploadModal";
import SymbolSelector from "./SymbolSelector";
import { runAIDailyStockStrategy } from "@/utils/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function OptionsView() {
  const { isAuthenticated } = useAuth();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isRunningAI, setIsRunningAI] = useState(false);

  const { optionsData, isLoading, error, isCreating, createOptions } =
    useOptionsData();

  const handleRunAIStrategy = async () => {
    setIsRunningAI(true);
    try {
      const result = await runAIDailyStockStrategy();
      if ("message" in result) {
        toast.success(
          result.message || "AI daily stock strategy completed successfully!",
        );
      } else {
        toast.success("AI daily stock strategy completed!");
      }
    } catch (error) {
      toast.error("An error occurred while running the AI strategy");
      console.error("AI Strategy error:", error);
    } finally {
      setIsRunningAI(false);
    }
  };

  // Filter options based on type and symbol
  const filteredOptions = optionsData.filter((option) => {
    const typeMatch = typeFilter === "ALL" || option.type === typeFilter;
    const symbolMatch =
      symbolFilter === undefined || option.symbol_id === symbolFilter;
    return typeMatch && symbolMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle>Options Data</CardTitle>
            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload Options Data
                </Button>
                <Button
                  onClick={handleRunAIStrategy}
                  disabled={isRunningAI}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4" />
                  {isRunningAI ? "Running..." : "Run AI Strategy"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Filter by Type:
              </span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="CALL_BUY">Call Buy</SelectItem>
                  <SelectItem value="CALL_SELL">Call Sell</SelectItem>
                  <SelectItem value="PUT_BUY">Put Buy</SelectItem>
                  <SelectItem value="PUT_SELL">Put Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Filter by Symbol:
              </span>
              <SymbolSelector
                value={symbolFilter}
                onChange={setSymbolFilter}
                showLabel={false}
                className="w-full sm:w-[200px]"
                filterType="STOCK"
                showName={true}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredOptions.length} of {optionsData.length} options
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading options data...</div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-red-600">Error: {error.message}</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <OptionsTable
          data={filteredOptions}
          isSymbolFiltered={!!symbolFilter}
        />
      )}

      <OptionsUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        createOptions={createOptions}
        isCreating={isCreating}
      />
    </div>
  );
}
