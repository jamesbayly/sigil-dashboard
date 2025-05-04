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
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Strategy Test Runs</h2>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>

      <div className="overflow-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Symbol Count</TableHead>
              <TableHead>Permutations</TableHead>
              <TableHead>Results</TableHead>
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
                  <TableCell>{testRun.name}</TableCell>
                  <TableCell>
                    <TimeAgo date={new Date(testRun.created_at)} />
                  </TableCell>
                  <TableCell>
                    {strategy?.name || testRun.strategy?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{testRun.symbol_ids.length}</TableCell>
                  <TableCell>{testRun.count_permutations}</TableCell>
                  <TableCell>{testRun.count_results}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
