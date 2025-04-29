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
  const { testRuns } = useTestRuns();
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
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testRuns.map((testRun) => {
              const strategy = strategies.find(
                (s) => s.id === testRun.strategy?.id
              );
              return (
                <tr key={testRun.id}>
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
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTestRun(testRun)}
                    >
                      View Full Results
                    </Button>
                  </TableCell>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
