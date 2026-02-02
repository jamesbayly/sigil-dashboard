import { useStrategies } from "@/hooks/useStrategies";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";

export default function StrategiesView() {
  const { strategies, isLoading } = useStrategies();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">Strategies</h2>
        {isAuthenticated && (
          <Button
            onClick={() => navigate("/strategies/create")}
            className="w-full sm:w-auto"
          >
            Create Strategy
          </Button>
        )}
      </div>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Symbols</TableHead>
              <TableHead className="whitespace-nowrap">Strategy Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            )}
            {strategies.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => navigate(`/strategies/${s.id}`)}
              >
                <TableCell className="whitespace-nowrap">{s.id}</TableCell>
                <TableCell className="whitespace-nowrap">{s.name}</TableCell>
                <TableCell className="whitespace-nowrap">{s.status}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {s.strategy_type}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {s.symbol_ids.length ?? "All"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {s.strategy_code}
                </TableCell>
              </TableRow>
            ))}
            {strategies.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5}>No strategies found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
