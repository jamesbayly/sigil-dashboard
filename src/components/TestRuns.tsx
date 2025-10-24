import { useTestRuns } from "@/hooks/useTestRuns";
import { Button } from "@/components/ui/button";
import TimeAgo from "react-timeago";
import { useStrategies } from "@/hooks/useStrategies";
import type { StrategyTestRunsResponse } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TestRunsView() {
  const navigate = useNavigate();
  const { testRuns, isLoading } = useTestRuns();
  const { strategies } = useStrategies();

  const openTestRun = (testRun: StrategyTestRunsResponse) =>
    navigate(`/tests/${testRun.id}`);

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

      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="whitespace-nowrap">Strategy</TableHead>
              <TableHead className="whitespace-nowrap">Symbol Count</TableHead>
              <TableHead className="whitespace-nowrap">Permutations</TableHead>
              <TableHead className="whitespace-nowrap">Results</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            )}
            {testRuns.map((testRun) => {
              const strategy = strategies.find(
                (s) => s.id === testRun.strategy?.id
              );
              return (
                <TableRow
                  key={testRun.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => openTestRun(testRun)}
                >
                  <TableCell className="whitespace-nowrap">
                    {testRun.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <TimeAgo date={new Date(testRun.created_at)} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {strategy?.name || testRun.strategy?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {testRun.symbol_ids.length}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {testRun.count_permutations}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {testRun.count_results}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
