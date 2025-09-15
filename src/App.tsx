import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HistoricTrades from "./components/HistoricTrades";
import OpenTrades from "./components/OpenTrades";
import StrategiesView from "./components/Strategies";
import TestRunsView from "./components/TestRuns";
import Nav from "./components/Nav";
import TestRunView from "./components/TestRun";
import StrategyView from "./components/Strategy";
import SymbolsView from "./components/Symbols";
import OptionsView from "./components/Options";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav />}>
          <Route index element={<Navigate to="/open" replace />} />
          <Route path="open" element={<OpenTrades />} />
          <Route path="history" element={<HistoricTrades />} />
          <Route path="strategies" element={<StrategiesView />} />
          <Route path="strategies/create" element={<StrategyView />} />
          <Route path="strategies/:id" element={<StrategyView />} />
          <Route path="tests" element={<TestRunsView />} />
          <Route path="tests/:testRunId" element={<TestRunView />} />
          <Route path="symbols" element={<SymbolsView />} />
          <Route path="options" element={<OptionsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
