import { useTestRuns } from "@/hooks/useTestRuns";
import { Button } from "@/components/ui/button";
import TimeAgo from "react-timeago";
import { useStrategies } from "@/hooks/useStrategies";
import type { StrategyTestRunsResponse } from "@/types";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { PaginationControls } from "./ui/pagination-controls";
import { ArrowUpDown } from "lucide-react";

export default function TestRunsView() {
  const navigate = useNavigate();
  const { testRuns, isLoading, pagination, setPage, setLimit } = useTestRuns();
  const { strategies } = useStrategies();

  const openTestRun = (testRun: StrategyTestRunsResponse) =>
    navigate(`/tests/${testRun.id}`);

  const columns: ColumnDef<StrategyTestRunsResponse>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <TimeAgo date={new Date(row.original.created_at)} />;
      },
    },
    {
      id: "strategy",
      accessorFn: (row) => {
        const strategy = strategies.find((s) => s.id === row.strategy?.id);
        return strategy?.name || row.strategy?.name || "Unknown";
      },
      header: "Strategy",
    },
    {
      accessorKey: "symbol_ids",
      header: "Symbol Count",
      cell: ({ row }) => {
        return row.original.symbol_ids.length;
      },
    },
    {
      accessorKey: "count_permutations",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Permutations
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "count_results",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Results
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <h2 className="text-2xl font-semibold">Strategy Test Runs</h2>
        <Button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-8">Loading test runs...</div>
      )}

      {!isLoading && (
        <>
          <DataTable
            data={testRuns}
            columns={columns}
            onRowClick={openTestRun}
          />
          {pagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </>
      )}
    </div>
  );
}
