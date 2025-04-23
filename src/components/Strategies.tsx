"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useStrategies } from "@/hooks/useStrategies";
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

// 1) Define your Zod schema
const strategySchema = z.object({
  name: z.string().min(2).max(100),
  symbol_ids: z.string().min(2),
  status: z.enum(["active", "inactive", "test"]),
  strategy_code: z.string(),
});
type StrategyFormValues = z.infer<typeof strategySchema>;
const strategyParameterSchema = z.object({
  code: z.string().min(2).max(50),
  description: z.string().min(2).max(999),
  value: z.number(),
  type: z.enum(["integer", "float", "boolean"]),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
});
type StrategyParameterFormValues = z.infer<typeof strategyParameterSchema>;

export default function StrategiesView() {
  const { list, add, edit } = useStrategies();
  const [editingId, setEditingId] = useState<number | null>(null);

  //
  // 2) “Add New” form instance
  //
  const addForm = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: "",
      symbol_ids: "[]",
      status: "inactive",
      strategy_code: "PRICE_ANALYSIS_1",
    },
  });

  const onAddSubmit = async (values: StrategyFormValues) => {
    await add({
      ...values,
      id: 0,
      parameters: [],
      symbol_ids: JSON.parse(values.symbol_ids),
    } as Strategy);
    addForm.reset();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Strategies</h2>
      {list.map((s) =>
        editingId === s.id ? (
          <StrategyEditRow
            key={s.id}
            strategy={s}
            onSave={async (vals) => {
              await edit(s.id, {
                ...vals,
                symbol_ids: JSON.parse(vals.symbol_ids),
              });
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={s.id}
            className="p-4 border rounded flex items-center justify-between"
          >
            <div className="space-y-1">
              <p>
                <span className="font-medium">Name:</span> {s.name}
              </p>
              <p>
                <span className="font-medium">Symbol IDs:</span> {s.symbol_ids}
              </p>
              <p>
                <span className="font-medium">Status:</span> {s.status},{" "}
              </p>
              <p>
                <span className="font-medium">Strategy Code:</span>{" "}
                {s.strategy_code}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingId(s.id)}
            >
              Edit
            </Button>
          </div>
        )
      )}

      {/*
        4) Add New Strategy form
      */}
      <div className="p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Add New Strategy</h3>
        <Form {...addForm}>
          <form
            onSubmit={addForm.handleSubmit(onAddSubmit)}
            className="space-y-4"
          >
            <FormField
              name="name"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="string" placeholder="STRATEGY_A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="symbol_ids"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol IDs</FormLabel>
                  <FormControl>
                    <Input type="string" placeholder="[2, 3]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="status"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
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
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Code</FormLabel>
                  <FormControl>
                    <Input type="string" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Strategy</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

///
/// Child‐component to edit a single strategy
///
interface StrategyEditRowProps {
  strategy: Strategy;
  onSave: (data: StrategyFormValues) => Promise<void>;
  onCancel: () => void;
}
function StrategyEditRow({ strategy, onSave, onCancel }: StrategyEditRowProps) {
  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: strategy.name,
      status: strategy.status,
      symbol_ids: strategy.symbol_ids.toString(),
      strategy_code: strategy.strategy_code,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave)}
        className="space-y-4 p-4 border rounded"
      >
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
                <Input {...field} />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
                <Input type="string" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2">
          <Button type="submit" size="sm">
            Save
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
