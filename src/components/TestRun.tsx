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
import { StrategyTestRunPermutationResponse } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useSymbols } from "@/hooks/useSymbols";

const TestRunPermutationsView: FC<{
  permutations: StrategyTestRunPermutationResponse[];
  onRowClick: (permutation: StrategyTestRunPermutationResponse) => void;
}> = ({ permutations, onRowClick }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Results with Many Trades</TableHead>
        <TableHead>Win Rate Max</TableHead>
        <TableHead>Win Rate Median</TableHead>
        <TableHead>PNL % Max</TableHead>
        <TableHead>PNL % Median</TableHead>
        <TableHead>PNL Amount Max</TableHead>
        <TableHead>PNL Amount Median</TableHead>
        <TableHead>Zella Score Max</TableHead>
        <TableHead>Zella Score Median</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {permutations.map((perm, index) => (
        <TableRow key={index} onClick={() => onRowClick(perm)}>
          <TableCell>{perm.name}</TableCell>
          <TableCell>{perm.results_with_many_trades}</TableCell>
          <TableCell>{perm.win_rate_max?.toFixed(2)}</TableCell>
          <TableCell>{perm.win_rate_median?.toFixed(2)}</TableCell>
          <TableCell>{perm.pnl_percent_max?.toFixed(2)}</TableCell>
          <TableCell>{perm.pnl_percent_median?.toFixed(2)}</TableCell>
          <TableCell>{perm.pnl_amount_max?.toFixed(2)}</TableCell>
          <TableCell>{perm.pnl_amount_median?.toFixed(2)}</TableCell>
          <TableCell>{perm.zella_score_max?.toFixed(2)}</TableCell>
          <TableCell>{perm.zella_score_median?.toFixed(2)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const TestRunPermutationsResultsView: FC<{
  permutation: StrategyTestRunPermutationResponse | undefined;
  closeSelf: (
    updatedPermutation: StrategyTestRunPermutationResponse | undefined
  ) => void;
}> = ({ permutation, closeSelf }) => {
  const { symbols } = useSymbols();

  const exportTestRunPermutationResults = () => {
    if (!permutation) return;
    const csvContent =
      "data:text/csv;charset=utf-8,perm_id,perm_name,symbol_id,symbol,trade_count,win_rate,pnl_%,pnl,zella\n" +
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

  return (
    <Dialog open={!!permutation} onOpenChange={() => closeSelf(undefined)}>
      <DialogContent className="max-h-screen overflow-y-auto w-screen">
        <DialogHeader>
          <DialogTitle>{permutation?.name}</DialogTitle>
          <DialogDescription>
            <Button
              variant="link"
              size="sm"
              onClick={exportTestRunPermutationResults}
            >
              Export Results
            </Button>
          </DialogDescription>
        </DialogHeader>
        <div>
          <h2>Results</h2>
          <p>
            {permutation?.results.length} results with many trades.{" "}
            {permutation?.results_with_many_trades} total results.
          </p>
          <p>
            Win Rate: {permutation?.win_rate_median.toFixed(2)} (Max:{" "}
            {permutation?.win_rate_max.toFixed(2)})
          </p>
          <p>
            PNL %: {permutation?.pnl_percent_median.toFixed(2)} (Max:{" "}
            {permutation?.pnl_percent_max.toFixed(2)})
          </p>
          <p>
            PNL Amount: {permutation?.pnl_amount_median.toFixed(2)} (Max:{" "}
            {permutation?.pnl_amount_max.toFixed(2)})
          </p>
          <p>
            Zella Score: {permutation?.zella_score_median.toFixed(2)} (Max:{" "}
            {permutation?.zella_score_max.toFixed(2)})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol Name</TableHead>
                <TableHead>Trade Count</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>PNL %</TableHead>
                <TableHead>PNL Amount</TableHead>
                <TableHead>Zella Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permutation?.results
                .filter((r) => r.trade_count > 0)
                .sort((a, b) => b.zella_score - a.zella_score)
                .map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      {symbols.find((s) => s.id === result.symbol_id)?.symbol}
                    </TableCell>
                    <TableCell>{result.trade_count}</TableCell>
                    <TableCell>{result.win_rate.toFixed(2)}</TableCell>
                    <TableCell>{result.pnl_percent?.toFixed(2)}</TableCell>
                    <TableCell>{result.pnl_amount?.toFixed(2)}</TableCell>
                    <TableCell>{result.zella_score.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TestRunView() {
  const [selectedPermutation, setSelectedPermutation] = useState<
    StrategyTestRunPermutationResponse | undefined
  >(undefined);
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

  const onPermRowClick = (permutation: StrategyTestRunPermutationResponse) => {
    // Handle row click if needed
    console.log("Row clicked:", permutation);
    setSelectedPermutation(permutation);
  };

  const exportTestRunResults = () => {
    if (!testRun) return;
    const csvContent =
      "data:text/csv;charset=utf-8,perm_id,perm_name,symbol_id,symbol,trade_count,win_rate,pnl_%,pnl,zella\n" +
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Test Run #{testRunId} {testRun?.name}
        </h1>
        <div>
          <Button variant="outline" size="sm" onClick={exportTestRunResults}>
            Export Results
          </Button>
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
            <p>Strategy: {testRun.strategy?.name || "Unknown"}</p>
            <p>Symbol Count: {testRun.symbol_ids.length}</p>
            <p>Permutations: {testRun.count_permutations}</p>
            <p>Results: {testRun.count_results}</p>

            <div>
              <h2>Test Run Permutations</h2>
              <TestRunPermutationsView
                permutations={testRun.permutations}
                onRowClick={onPermRowClick}
              />
            </div>
          </div>
        ) : null}
      </div>
      <TestRunPermutationsResultsView
        permutation={selectedPermutation}
        closeSelf={setSelectedPermutation}
      />
    </div>
  );
}
