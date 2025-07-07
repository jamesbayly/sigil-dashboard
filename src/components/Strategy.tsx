import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  getStrategies,
  createStrategy,
  updateStrategy,
  createTestRun,
  createTestRunForSymbol,
} from "@/utils/api";
import type { Strategy } from "@/types";
import { isGenericResponse } from "@/types";
import { useSymbols } from "@/hooks/useSymbols";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Zod schema for strategy parameter
const parameterSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(2).max(50),
  description: z.string().min(2).max(999),
  value: z.number(),
  type: z.enum(["integer", "float", "boolean"]),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
});

// Zod schema for strategy
const strategySchema = z.object({
  name: z.string().min(2).max(100),
  symbol_ids: z.string(), // comma-separated or JSON array string
  status: z.enum(["active", "inactive", "test"]),
  strategy_code: z.string(),
  parameters: z.array(parameterSchema),
});
type StrategyFormValues = z.infer<typeof strategySchema>;

type Mode = "create" | "edit";

export default function StrategyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mode: Mode = id === "create" ? "create" : "edit";
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  // Use symbols hook
  const { symbols, isLoading: symbolsLoading } = useSymbols();

  // Test run dialog state
  const [isTestRunDialogOpen, setIsTestRunDialogOpen] = useState(false);
  const [permutationCount, setPermutationCount] = useState<string>("");
  const [isCreatingTestRun, setIsCreatingTestRun] = useState(false);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>("all");

  // Fetch strategy if editing
  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      getStrategies()
        .then((res) => {
          if (Array.isArray(res)) {
            const found = res.find((s) => s.id === Number(id));
            if (found) setStrategy(found);
            else toast.error("Strategy not found");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, mode]);

  // Setup form
  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues:
      mode === "edit" && strategy
        ? {
            name: strategy.name,
            symbol_ids: JSON.stringify(strategy.symbol_ids),
            status: strategy.status,
            strategy_code: strategy.strategy_code,
            parameters: strategy.parameters || [],
          }
        : {
            name: "",
            symbol_ids: "[]",
            status: "inactive",
            strategy_code: "",
            parameters: [],
          },
  });

  // Update form when strategy loads
  useEffect(() => {
    if (mode === "edit" && strategy) {
      form.reset({
        name: strategy.name,
        symbol_ids: JSON.stringify(strategy.symbol_ids),
        status: strategy.status,
        strategy_code: strategy.strategy_code,
        parameters: strategy.parameters || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy]);

  // Field array for parameters
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  // Handle submit
  const onSubmit = async (values: StrategyFormValues) => {
    setLoading(true);
    try {
      // Parse symbol_ids with error handling
      let symbolIds: number[];
      try {
        symbolIds = JSON.parse(values.symbol_ids);
        if (
          !Array.isArray(symbolIds) ||
          !symbolIds.every((id) => typeof id === "number")
        ) {
          throw new Error("Symbol IDs must be an array of numbers");
        }
      } catch {
        toast.error(
          "Invalid symbol IDs format. Please use a valid JSON array like [1,2,3]"
        );
        return;
      }

      const basePayload = {
        name: values.name,
        symbol_ids: symbolIds,
        status: values.status,
        strategy_code: values.strategy_code,
        parameters: values.parameters.map((param) => ({
          ...param,
          id: param.id ?? undefined,
          min_value: param.min_value ?? undefined,
          max_value: param.max_value ?? undefined,
        })),
      };

      if (mode === "create") {
        const result = await createStrategy(basePayload);
        if (isGenericResponse(result)) {
          toast.error(result.message);
        } else {
          toast.success("Strategy created");
          navigate(`/strategies/${result.id}`);
          setStrategy(result);
        }
      } else if (mode === "edit" && strategy) {
        const payload: Strategy = {
          id: strategy.id,
          ...basePayload,
        };
        const result = await updateStrategy(payload);
        if (isGenericResponse(result)) {
          toast.error(result.message);
        } else {
          toast.success("Strategy updated");
          setStrategy(result);
        }
      }
    } catch {
      toast.error("Failed to save strategy");
    } finally {
      setLoading(false);
    }
  };

  // Handle test run creation
  const handleCreateTestRun = async () => {
    if (!strategy) {
      toast.error("No strategy available");
      return;
    }

    setIsCreatingTestRun(true);
    try {
      const permutations = permutationCount
        ? parseInt(permutationCount)
        : undefined;

      let result;
      if (selectedSymbolId && selectedSymbolId !== "all") {
        // Create test run for specific symbol
        const symbolId = parseInt(selectedSymbolId);
        result = await createTestRunForSymbol(
          strategy.id,
          symbolId,
          permutations
        );
      } else {
        // Create test run for all symbols
        result = await createTestRun(strategy.id, permutations);
      }

      if (isGenericResponse(result)) {
        toast.error(result.message);
      } else {
        const symbolName =
          selectedSymbolId && selectedSymbolId !== "all"
            ? symbols.find((s) => s.id === parseInt(selectedSymbolId))?.name
            : "all symbols";
        toast.success(`Test run created successfully for ${symbolName}`);
        setIsTestRunDialogOpen(false);
        setPermutationCount("");
        setSelectedSymbolId("all");
      }
    } catch {
      toast.error("Failed to create test run");
    } finally {
      setIsCreatingTestRun(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {mode === "create" ? "Create Strategy" : `Edit Strategy #${id}`}
            </CardTitle>
            {mode === "edit" && strategy && (
              <Dialog
                open={isTestRunDialogOpen}
                onOpenChange={setIsTestRunDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Create Test Run</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Create Test Run for {strategy.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="symbol">Symbol (optional)</Label>
                      <Select
                        value={selectedSymbolId}
                        onValueChange={setSelectedSymbolId}
                        disabled={symbolsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              symbolsLoading
                                ? "Loading symbols..."
                                : "Select a symbol (optional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All symbols</SelectItem>
                          {symbols.map((symbol) => (
                            <SelectItem
                              key={symbol.id}
                              value={symbol.id.toString()}
                            >
                              {symbol.name} ({symbol.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="permutations">
                        Permutation Count (optional)
                      </Label>
                      <Input
                        id="permutations"
                        type="number"
                        placeholder="10"
                        value={permutationCount}
                        onChange={(e) => setPermutationCount(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsTestRunDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTestRun}
                      disabled={isCreatingTestRun}
                    >
                      {isCreatingTestRun ? "Creating..." : "Create Test Run"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="symbol_ids"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol IDs</FormLabel>
                    <FormControl>
                      <Input placeholder="[2,3]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="test">Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="strategy_code"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Parameters</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      append({
                        code: "",
                        description: "",
                        value: 0,
                        type: "integer",
                        min_value: undefined,
                        max_value: undefined,
                      })
                    }
                  >
                    Add Parameter
                  </Button>
                </div>
                <div className="space-y-2">
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 border p-2 rounded"
                    >
                      <FormField
                        name={`parameters.${idx}.code` as const}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name={`parameters.${idx}.description` as const}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 items-end justify-between">
                        <FormField
                          name={`parameters.${idx}.value` as const}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? 0}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name={`parameters.${idx}.type` as const}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="integer">
                                      Integer
                                    </SelectItem>
                                    <SelectItem value="float">Float</SelectItem>
                                    <SelectItem value="boolean">
                                      Boolean
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name={`parameters.${idx}.min_value` as const}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormLabel>Min</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name={`parameters.${idx}.max_value` as const}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormLabel>Max</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => remove(idx)}
                          className="self-center"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={loading}>
                  {mode === "create" ? "Create" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/strategies")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
