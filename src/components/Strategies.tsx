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
  code: z.string().min(2).max(50),
  description: z.string().min(2).max(999),
  value: z.number(),
  type: z.enum(["integer", "float", "boolean"]),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
});
type StrategyFormValues = z.infer<typeof strategySchema>;

export default function StrategiesView() {
  const { list, add, edit } = useStrategies();
  const [editingId, setEditingId] = useState<number | null>(null);

  //
  // 2) “Add New” form instance
  //
  const addForm = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      code: "",
      description: "",
      value: 0,
      type: "integer",
      min_value: undefined,
      max_value: undefined,
    },
  });

  const onAddSubmit = async (values: StrategyFormValues) => {
    await add(values);
    addForm.reset();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Strategies</h2>

      {/*
        3) Loop through all strategies,
           show either a read‐only row or an edit form
      */}
      {list.map((s) =>
        editingId === s.id ? (
          <StrategyEditRow
            key={s.id}
            strategy={s}
            onSave={async (vals) => {
              await edit(s.id, vals);
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
                <span className="font-medium">Code:</span> {s.code}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {s.description}
              </p>
              <p>
                <span className="font-medium">Type:</span> {s.type},{" "}
                <span className="font-medium">Value:</span> {s.value}
              </p>
              <p className="text-sm text-muted-foreground">
                Min: {s.min_value ?? "-"}, Max: {s.max_value ?? "-"}
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
              name="code"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="STRATEGY_A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="What does it do?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="type"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="float">Float</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="value"
              control={addForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                name="min_value"
                control={addForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Value</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="max_value"
                control={addForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Value</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
      code: strategy.code,
      description: strategy.description,
      type: strategy.type,
      value: strategy.value,
      min_value: strategy.min_value,
      max_value: strategy.max_value,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave)}
        className="space-y-4 p-4 border rounded"
      >
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="integer">Integer</SelectItem>
                    <SelectItem value="float">Float</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="value"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <FormField
            name="min_value"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="max_value"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
