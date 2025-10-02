import { useTestRun } from "@/hooks/useTestRun";
import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import TimeAgo from "react-timeago";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  isGenericResponse,
  StrategyTestRunPermutationResponse,
  StrategyTestRunPermutationResultResponse,
} from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useSymbols } from "@/hooks/useSymbols";
import { refreshTestRun } from "@/utils/api";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import { ArrowUpDown } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { getNumberStyling } from "@/lib/utils";

const TestRunPermutationsView: FC<{
  permutations: StrategyTestRunPermutationResponse[];
  onRowClick: (permutation: StrategyTestRunPermutationResponse) => void;
}> = ({ permutations, onRowClick }) => {
  const columns: ColumnDef<StrategyTestRunPermutationResponse>[] = [
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
      accessorKey: "results_with_many_trades",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Results with Many Trades
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "sqn_score_max",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SQN
            <br />
            Score
            <br />
            Max
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span>{row.original.sqn_score_max?.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "sqn_score_average",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SQN
            <br />
            Score
            <br />
            Avg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span>{row.original.sqn_score_average?.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "sqn_score_median",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SQN
            <br />
            Score
            <br />
            Med
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span>{row.original.sqn_score_median?.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "win_rate_max",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Win Rate Max
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.win_rate_max;
        return (
          <span className={getNumberStyling(value, 50)}>
            {value?.toFixed()}%
          </span>
        );
      },
    },
    {
      accessorKey: "win_rate_average",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Win Rate Avg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.win_rate_average;
        return (
          <span className={getNumberStyling(value, 50)}>
            {value?.toFixed(0)}%
          </span>
        );
      },
    },
    {
      accessorKey: "win_rate_median",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Win Rate Med
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.win_rate_median;
        return (
          <span className={getNumberStyling(value, 50)}>
            {value?.toFixed(0)}%
          </span>
        );
      },
    },
    {
      accessorKey: "pnl_percent_max",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PNL % Max
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.pnl_percent_max;
        return (
          <span className={getNumberStyling(value)}>{value?.toFixed(1)}%</span>
        );
      },
    },
    {
      accessorKey: "pnl_percent_average",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PNL % Avg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.pnl_percent_average;
        return (
          <span className={getNumberStyling(value)}>{value?.toFixed(1)}%</span>
        );
      },
    },
    {
      accessorKey: "pnl_percent_median",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PNL % Med
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.pnl_percent_median;
        return (
          <span className={getNumberStyling(value)}>{value?.toFixed(1)}%</span>
        );
      },
    },
    {
      accessorKey: "pnl_amount_max",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PNL Amount Max
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.pnl_amount_max;
        return (
          <span className={getNumberStyling(value)}>{value?.toFixed(2)}</span>
        );
      },
    },
    {
      accessorKey: "pnl_amount_average",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PNL Amount Avg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.pnl_amount_average;
        return (
          <span className={getNumberStyling(value)}>{value?.toFixed(2)}</span>
        );
      },
    },
    {
      accessorKey: "pnl_amount_median",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PNL Amount Med
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.pnl_amount_median;
        return (
          <span className={getNumberStyling(value)}>{value?.toFixed(2)}</span>
        );
      },
    },
    {
      accessorKey: "zella_score_max",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Zella
            <br />
            Score
            <br />
            Max
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span>{row.original.zella_score_max?.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "zella_score_average",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Zella
            <br />
            Score
            <br />
            Avg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span>{row.original.zella_score_average?.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "zella_score_median",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Zella
            <br />
            Score
            <br />
            Med
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span>{row.original.zella_score_median?.toFixed(1)}</span>;
      },
    },
  ];

  return (
    <DataTable data={permutations} columns={columns} onRowClick={onRowClick} />
  );
};

const TestRunPermutationsResultsView: FC<{
  permutation: StrategyTestRunPermutationResponse | undefined;
  closeSelf: (
    updatedPermutation: StrategyTestRunPermutationResponse | undefined
  ) => void;
  doRefreshTestRun: (permutationID?: number) => void;
}> = ({ permutation, closeSelf, doRefreshTestRun }) => {
  const { symbols } = useSymbols();

  const resultsColumns: ColumnDef<StrategyTestRunPermutationResultResponse>[] =
    [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
          return <span>{row.original.id}</span>;
        },
      },
      {
        accessorKey: "symbol_id",
        header: "Symbol Name",
        cell: ({ row }) => {
          const symbol = symbols.find((s) => s.id === row.original.symbol_id);
          return (
            <span>
              {symbol?.symbol} ({symbol?.id})
            </span>
          );
        },
      },
      {
        accessorKey: "trade_count",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Trade Count
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "win_rate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Win Rate
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.original.win_rate;
          return (
            <span className={getNumberStyling(value, 50)}>
              {value.toFixed(2)}%
            </span>
          );
        },
      },
      {
        accessorKey: "pnl_percent",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              PNL %
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.original.pnl_percent;
          return (
            <span className={getNumberStyling(value)}>
              {value?.toFixed(2)}%
            </span>
          );
        },
      },
      {
        accessorKey: "pnl_amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              PNL Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.original.pnl_amount;
          return (
            <span className={getNumberStyling(value)}>{value?.toFixed(2)}</span>
          );
        },
      },
      {
        accessorKey: "zella_score",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Zella Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <span>{row.original.zella_score.toFixed(2)}</span>;
        },
      },
      {
        accessorKey: "sqn",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              SQN Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <span>{row.original.sqn.toFixed(2)}</span>;
        },
      },
    ];

  const exportTestRunPermutationResults = () => {
    if (!permutation) return;
    const csvContent =
      "data:text/csv;charset=utf-8,perm_id,perm_name,symbol_id,symbol,trade_count,win_rate,pnl_%,pnl,zella,sqn\n" +
      permutation.results
        .map((result) => {
          return [
            permutation.id,
            permutation.name,
            result.symbol_id,
            symbols.find((s) => s.id === result.symbol_id)?.symbol,
            result.trade_count,
            result.win_rate,
            result.pnl_percent,
            result.pnl_amount,
            result.zella_score,
            result.sqn,
          ].join(",");
        })
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${permutation.name}-results.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredResults =
    permutation?.results
      .filter((r) => r.trade_count > 0)
      .sort((a, b) => b.zella_score - a.zella_score) || [];

  return (
    <Dialog open={!!permutation} onOpenChange={() => closeSelf(undefined)}>
      <DialogContent className="max-h-screen max-w-full flex flex-col overflow-scroll">
        <DialogHeader>
          <DialogTitle>{permutation?.name}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Results Overview</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={exportTestRunPermutationResults}
            >
              Export Results
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Refresh Test Run
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Refresh and rerun missing test run results?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action may take some time
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => doRefreshTestRun(permutation?.id)}
                  >
                    Refresh Test Run
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p>Permutation ID: {permutation?.id}</p>
          <p>
            {permutation?.results.length} results with many trades.{" "}
            {permutation?.results_with_many_trades} total results.
          </p>
          <p>
            Median Win Rate: {permutation?.win_rate_median?.toFixed(2)} (Max:{" "}
            {permutation?.win_rate_max?.toFixed(2)}) (Avg:{" "}
            {permutation?.win_rate_average?.toFixed(2)})
          </p>
          <p>
            Median PNL %: {permutation?.pnl_percent_median?.toFixed(2)} (Max:{" "}
            {permutation?.pnl_percent_max?.toFixed(2)}) (Avg:{" "}
            {permutation?.pnl_percent_average?.toFixed(2)})
          </p>
          <p>
            Median PNL Amount: {permutation?.pnl_amount_median?.toFixed(2)}{" "}
            (Max: {permutation?.pnl_amount_max?.toFixed(2)}) (Avg:{" "}
            {permutation?.pnl_amount_average?.toFixed(2)})
          </p>
          <p>
            Median Zella Score: {permutation?.zella_score_median?.toFixed(2)}{" "}
            (Max: {permutation?.zella_score_max?.toFixed(2)}) (Avg:{" "}
            {permutation?.zella_score_average?.toFixed(2)})
          </p>
          <p>
            Median SQN Score: {permutation?.sqn_score_median?.toFixed(2)} (Max:{" "}
            {permutation?.sqn_score_max?.toFixed(2)}) (Avg:{" "}
            {permutation?.sqn_score_average?.toFixed(2)})
          </p>
          <h2 className="font-bold text-lg">Parameters</h2>
          <ul>
            {permutation?.parameters.map((param, index) => (
              <li key={index}>
                {param.code}: {param.value}
              </li>
            ))}
          </ul>
          <h2 className="font-bold text-lg">Results</h2>
          <DataTable data={filteredResults} columns={resultsColumns} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TestRunView() {
  const [selectedPermutation, setSelectedPermutation] = useState<
    StrategyTestRunPermutationResponse | undefined
  >(undefined);
  const [showOnlyWithManyTrades, setShowOnlyWithManyTrades] = useState(false);
  const { testRunId } = useParams();
  const { symbols } = useSymbols();
  const { testRun, onDelete, isLoading, error } = useTestRun(Number(testRunId));
  const navigate = useNavigate();

  useEffect(() => {
    // Validate that testRunId is a number
    if (testRunId === undefined || isNaN(Number(testRunId))) {
      // If not a valid number, navigate back to the tests list
      navigate("/tests");
    }
  }, [testRunId, navigate]);

  // If the ID is invalid, we'll be redirected before rendering this
  if (testRunId === undefined || isNaN(Number(testRunId))) {
    return null; // Prevents flash of content before redirect
  }

  const handleDeleteTestRun = async () => {
    if (testRunId) {
      await onDelete(parseInt(testRunId, 10));
      navigate("/tests");
    }
  };

  const onPermRowClick = (permutation: StrategyTestRunPermutationResponse) =>
    setSelectedPermutation(permutation);

  const exportTestRunResults = () => {
    if (!testRun) return;
    const csvContent =
      "data:text/csv;charset=utf-8,perm_id,perm_name,symbol_id,symbol,trade_count,win_rate,pnl_%,pnl,zella,sqn\n" +
      testRun.permutations
        .flatMap((perm) =>
          perm.results.map((result) => {
            return [
              perm.id,
              perm.name,
              result.symbol_id,
              symbols.find((s) => s.id === result.symbol_id)?.symbol,
              result.trade_count,
              result.win_rate,
              result.pnl_percent,
              result.pnl_amount,
              result.zella_score,
              result.sqn,
            ].join(",");
          })
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${testRun.name}-results.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const doRefreshTestRun = async (permutationID: number | undefined) => {
    const res = await refreshTestRun(parseInt(testRunId, 10), permutationID);
    if (isGenericResponse(res)) {
      toast.error(res.message);
    }
  };

  // Filter permutations based on the toggle state
  const filteredPermutations =
    testRun?.permutations.filter((perm) =>
      showOnlyWithManyTrades ? perm.results_with_many_trades > 0 : true
    ) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Test Run #{testRunId} {testRun?.name}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportTestRunResults}>
            Export Results
          </Button>
          <Toggle
            variant={showOnlyWithManyTrades ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyWithManyTrades(!showOnlyWithManyTrades)}
          >
            {showOnlyWithManyTrades
              ? "Show All Trades"
              : "Show Only With Many Trades"}
          </Toggle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                Refresh Test Run
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Refresh and rerun missing test run results?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action may take some time
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => doRefreshTestRun(undefined)}>
                  Refresh Test Run
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                Delete Test Run
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete this test run and all of its data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  data related to this test run.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTestRun}>
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Test run details content will go here */}
      <div className="border rounded p-4">
        {isLoading ? <p>Loading test run data for ID: {testRunId}...</p> : null}
        {error ? <p>Error loading</p> : null}
        {testRun ? (
          <div>
            <h2>Test Run Details</h2>
            <p>Name: {testRun.name}</p>
            <p>
              Created At: {new Date(testRun.created_at).toLocaleString()} (
              <TimeAgo date={new Date(testRun.created_at)} />)
            </p>
            <p>
              <strong>
                Percent complete:{" "}
                {(
                  (testRun.count_results /
                    (testRun.count_permutations * testRun.symbol_ids.length)) *
                  100
                ).toFixed(1)}
                %
              </strong>
            </p>
            <p>Strategy: {testRun.strategy?.name || "Unknown"}</p>
            <p>Symbol Count: {testRun.symbol_ids.length}</p>
            <p>Permutations: {testRun.count_permutations}</p>
            <p>Results: {testRun.count_results}</p>

            <div>
              <h2>Test Run Permutations</h2>
              <p className="text-sm text-gray-600 mb-2">
                Showing {filteredPermutations.length} of{" "}
                {testRun.permutations.length} permutations
                {showOnlyWithManyTrades &&
                  " (filtered to show only permutations with many trades)"}
              </p>
              <TestRunPermutationsView
                permutations={filteredPermutations}
                onRowClick={onPermRowClick}
              />
            </div>
          </div>
        ) : null}
      </div>
      <TestRunPermutationsResultsView
        permutation={selectedPermutation}
        closeSelf={setSelectedPermutation}
        doRefreshTestRun={doRefreshTestRun}
      />
    </div>
  );
}
