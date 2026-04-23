import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TimeAgo from "react-timeago";
import { ColumnDef } from "@tanstack/react-table";
import {
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { useCopyTraderAccounts } from "@/hooks/useCopyTraderAccounts";
import { useStrategies } from "@/hooks/useStrategies";
import { StrategyType, type CopyTraderAccountDetailResponse } from "@/types";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ─── Zod schemas ────────────────────────────────────────────────────────────

const createSchema = z.object({
  wallet_address: z.string().min(10, "Wallet address is required"),
  strategy_id: z.number().positive("Strategy is required"),
  size_usd: z.number().positive().optional(),
  min_source_size_usd: z.number().positive().optional(),
});
type CreateFormValues = z.infer<typeof createSchema>;

const editSchema = z.object({
  is_active: z.boolean().optional(),
  strategy_id: z.number().positive().optional(),
  size_usd: z.number().positive().nullable().optional(),
  min_source_size_usd: z.number().positive().nullable().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

// ─── Add Dialog ──────────────────────────────────────────────────────────────

function AddAccountDialog({
  open,
  onOpenChange,
  strategyOptions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  strategyOptions: { id: number; name: string }[];
  onSubmit: (values: CreateFormValues) => Promise<void>;
}) {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      wallet_address: "",
      strategy_id: undefined,
      size_usd: undefined,
      min_source_size_usd: undefined,
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: CreateFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Copy Trader Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0xabc..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="strategy_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {strategyOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Size USD{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional, default $20)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="50"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_source_size_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Min Source USD{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="100"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ─────────────────────────────────────────────────────────────

function EditAccountDialog({
  account,
  open,
  onOpenChange,
  strategyOptions,
  onSubmit,
}: {
  account: CopyTraderAccountDetailResponse;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  strategyOptions: { id: number; name: string }[];
  onSubmit: (id: number, values: EditFormValues) => Promise<void>;
}) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      is_active: account.is_active,
      strategy_id: account.strategy_id,
      size_usd: account.size_usd ?? null,
      min_source_size_usd: account.min_source_size_usd ?? null,
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: EditFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(account.id, values);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account — {account.user_name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label>Active</Label>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="strategy_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {strategyOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Size USD{" "}
                      <span className="text-muted-foreground text-xs">
                        (blank = default $20)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="50"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_source_size_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Min Source USD{" "}
                      <span className="text-muted-foreground text-xs">
                        (blank = none)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="100"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CopyTrader() {
  const { accounts, isLoading, add, edit, remove } = useCopyTraderAccounts();
  const { strategies } = useStrategies();

  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] =
    useState<CopyTraderAccountDetailResponse | null>(null);
  const [deleteAccount, setDeleteAccount] =
    useState<CopyTraderAccountDetailResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const strategyOptions = strategies
    .filter((s) => s.strategy_type === StrategyType.POLYMARKET)
    .map((s) => ({ id: s.id, name: s.name }));

  const handleAdd = async (values: CreateFormValues) => {
    try {
      await add({
        wallet_address: values.wallet_address,
        strategy_id: values.strategy_id,
        size_usd: values.size_usd,
        min_source_size_usd: values.min_source_size_usd,
      });
      toast.success("Account added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add account");
      throw err;
    }
  };

  const handleEdit = async (id: number, values: EditFormValues) => {
    try {
      await edit(id, values);
      toast.success("Account updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update account",
      );
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;
    setDeleting(true);
    try {
      await remove(deleteAccount.id);
      toast.success(`Account "${deleteAccount.user_name}" deactivated`);
      setDeleteAccount(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to deactivate account",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<CopyTraderAccountDetailResponse>[] = [
    {
      accessorKey: "user_name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.user_name}</div>
          <div
            className="text-xs text-muted-foreground font-mono truncate max-w-[180px]"
            title={row.original.wallet_address}
          >
            {row.original.wallet_address}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="default" className="flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" /> Inactive
          </Badge>
        ),
    },
    {
      accessorKey: "strategy_id",
      header: "Strategy",
      cell: ({ row }) => {
        const strategy = strategies.find(
          (s) => s.id === row.original.strategy_id,
        );
        return strategy ? (
          <span className="text-sm">{strategy.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">
            #{row.original.strategy_id}
          </span>
        );
      },
    },
    {
      accessorKey: "trade_stats",
      header: "Trades",
      cell: ({ row }) => {
        const { total, executed, skipped, failed } = row.original.trade_stats;
        return (
          <div className="text-sm space-x-2">
            <span className="text-muted-foreground">{total} total</span>
            <span className="text-green-500">{executed} exec</span>
            <span className="text-yellow-500">{skipped} skip</span>
            {failed > 0 && <span className="text-red-500">{failed} fail</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "size_usd",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.size_usd != null ? (
            `$${row.original.size_usd}`
          ) : (
            <span className="text-muted-foreground">default</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "min_source_size_usd",
      header: "Min Source",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.min_source_size_usd != null ? (
            `$${row.original.min_source_size_usd}`
          ) : (
            <span className="text-muted-foreground">none</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "last_checked_at",
      header: "Last Active",
      cell: ({ row }) =>
        row.original.last_checked_at ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <TimeAgo date={row.original.last_checked_at} />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditAccount(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteAccount(row.original)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Summary stats
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.is_active).length;
  const totalTrades = accounts.reduce((sum, a) => sum + a.trade_stats.total, 0);
  const totalExecuted = accounts.reduce(
    (sum, a) => sum + a.trade_stats.executed,
    0,
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Copy Trader</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track wallets and auto-copy their Polymarket trades. Polls every
            ~60s.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tracked Wallets</CardDescription>
            <CardTitle className="text-3xl">{totalAccounts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {activeAccounts}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Trades Seen</CardDescription>
            <CardTitle className="text-3xl">{totalTrades}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Executed</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {totalExecuted}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Accounts table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No accounts yet. Add one to start copy trading.
            </p>
          ) : (
            <DataTable columns={columns} data={accounts} />
          )}
        </CardContent>
      </Card>

      {/* Add dialog */}
      <AddAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        strategyOptions={strategyOptions}
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      {editAccount && (
        <EditAccountDialog
          account={editAccount}
          open={!!editAccount}
          onOpenChange={(v) => {
            if (!v) setEditAccount(null);
          }}
          strategyOptions={strategyOptions}
          onSubmit={handleEdit}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteAccount}
        onOpenChange={(v) => {
          if (!v) setDeleteAccount(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate <strong>{deleteAccount?.user_name}</strong> (
              {deleteAccount?.wallet_address}). Trade history is preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
