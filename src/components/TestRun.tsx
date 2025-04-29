import { useTestRun } from "@/hooks/useTestRun";
import { useEffect } from "react";
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

export default function TestRunView() {
  const { testRunId } = useParams();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Test Run #{testRunId} {testRun?.name}
        </h1>
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
        <Button onClick={() => navigate("/tests")}>Back to Test Runs</Button>
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
              {testRun.permutations.map((perm, index) => (
                <div key={index} className="border rounded p-2 mb-2">
                  <h4 className="font-semibold">{perm.name}</h4>
                  <h3>Results</h3>
                  <div>
                    {perm.results.map((res, index) => (
                      <div key={index} className="border rounded p-2 mb-2">
                        <h4 className="font-semibold">Result #{res.id}</h4>
                        <p>Symbol ID: {res.symbol_id}</p>
                        <p>Profit/Loss $: {res.pnl_amount?.toFixed(2)}</p>
                        <p>
                          Profit/Loss Percent: {res.pnl_percent?.toFixed(2)}%
                        </p>
                        <p>Trades: {res.trade_count}</p>
                        <p>Win Rate: {res.win_rate}</p>
                        <p>Zella Score: {res.zella_score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
