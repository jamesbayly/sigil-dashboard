import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { getStrategies, createStrategy, updateStrategy } from "@/utils/api";
import type { Strategy } from "@/types";
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
      const payload: Strategy = {
        id: mode === "edit" && strategy ? strategy.id : 0,
        name: values.name,
        symbol_ids: JSON.parse(values.symbol_ids),
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
        await createStrategy(payload);
        toast.success("Strategy created");
        navigate("/strategies");
      } else if (mode === "edit" && strategy) {
        await updateStrategy(payload);
        toast.success("Strategy updated");
        navigate("/strategies");
      }
    } catch {
      toast.error("Failed to save strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create Strategy" : `Edit Strategy #${id}`}
          </CardTitle>
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
