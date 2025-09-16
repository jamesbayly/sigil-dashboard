import TradesTable from "./TradesTable";

export default function HistoricTrades() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Historic Trades</h2>
      <TradesTable title="Historic Trades" />
    </div>
  );
}
