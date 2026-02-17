import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HistoricTrades from "./components/HistoricTrades";
import OpenTrades from "./components/OpenTrades";
import StrategiesView from "./components/Strategies";
import TestRunsView from "./components/TestRuns";
import Nav from "./components/Nav";
import TestRunView from "./components/TestRun";
import StrategyView from "./components/Strategy";
import SymbolsView from "./components/Symbols";
import SymbolPage from "./components/SymbolPage";
import OptionsView from "./components/Options";
import NewsList from "./components/NewsList";
import NewsDetail from "./components/NewsDetail";
import ParsedNews from "./components/ParsedNews";
import PolymarketMarkets from "./components/PolymarketMarkets";
import PolymarketMarket from "./components/PolymarketMarket";
import Industries from "./components/Industries";
import Industry from "./components/Industry";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav />}>
          <Route index element={<Navigate to="/symbols" replace />} />
          <Route path="open" element={<OpenTrades />} />
          <Route path="history" element={<HistoricTrades />} />
          <Route path="strategies" element={<StrategiesView />} />
          <Route path="strategies/create" element={<StrategyView />} />
          <Route path="strategies/:id" element={<StrategyView />} />
          <Route path="tests" element={<TestRunsView />} />
          <Route path="tests/:testRunId" element={<TestRunView />} />
          <Route path="symbols" element={<SymbolsView />} />
          <Route path="symbols/create" element={<SymbolPage />} />
          <Route path="symbols/:id" element={<SymbolPage />} />
          <Route path="options" element={<OptionsView />} />
          <Route path="news" element={<NewsList />} />
          <Route path="news/create" element={<NewsDetail />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="parsed-news" element={<ParsedNews />} />
          <Route path="polymarket" element={<PolymarketMarkets />} />
          <Route path="polymarket/:id" element={<PolymarketMarket />} />
          <Route
            path="industries"
            element={<Navigate to="/industries/list" replace />}
          />
          <Route path="industries/list" element={<Industries />} />
          <Route path="industries/map" element={<Industries />} />
          <Route path="industries/:id" element={<Industry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
