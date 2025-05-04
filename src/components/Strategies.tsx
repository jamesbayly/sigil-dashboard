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

export default function StrategiesView() {
  const { strategies, isLoading } = useStrategies();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Strategies</h2>
        <Button onClick={() => navigate("/strategies/create")}>
          Create Strategy
        </Button>
      </div>
      <div className="overflow-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Symbols</TableHead>
              <TableHead>Strategy Code</TableHead>
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
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>{s.symbol_ids.length ?? "All"}</TableCell>
                <TableCell>{s.strategy_code}</TableCell>
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
