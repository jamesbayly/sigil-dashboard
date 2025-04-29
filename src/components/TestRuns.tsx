import { useTestRuns } from "@/hooks/useTestRuns";
import { Button } from "@/components/ui/button";
import TimeAgo from "react-timeago";
import { useStrategies } from "@/hooks/useStrategies";
import type { StrategyTestRunsResponse } from "@/types";

export default function TestRunsView() {
  const { testRuns } = useTestRuns();
  const { strategies } = useStrategies();

  const openTestRun = (testRun: StrategyTestRunsResponse) => {
    console.log(testRun);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Strategy Test Runs</h2>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Strategy</th>
              <th>Symbol Count</th>
              <th>Permutations</th>
              <th>Results</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {testRuns.map((testRun) => {
              const strategy = strategies.find(
                (s) => s.id === testRun.strategy?.id
              );
              return (
                <tr key={testRun.id}>
                  <td>{testRun.name}</td>
                  <td>
                    <TimeAgo date={new Date(testRun.created_at)} />
                  </td>
                  <td>
                    {strategy?.name || testRun.strategy?.name || "Unknown"}
                  </td>
                  <td>{testRun.symbol_ids.length}</td>
                  <td>{testRun.count_permutations}</td>
                  <td>{testRun.count_results}</td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTestRun(testRun)}
                    >
                      View Full Results
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
