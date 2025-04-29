import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OpenTrades from "./OpenTrades";
import HistoricTrades from "./HistoricTrades";
import StrategiesView from "./Strategies";
import TestRunsView from "./TestRuns";

export default function TabsView() {
  return (
    <Tabs defaultValue="open" className="w-full">
      <TabsList>
        <TabsTrigger value="open">Open</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="strategies">Strategies</TabsTrigger>
        <TabsTrigger value="tests">Test Runs</TabsTrigger>
      </TabsList>

      <TabsContent value="open">
        <OpenTrades />
      </TabsContent>
      <TabsContent value="history">
        <HistoricTrades />
      </TabsContent>
      <TabsContent value="strategies">
        <StrategiesView />
      </TabsContent>
      <TabsContent value="tests">
        <TestRunsView />
      </TabsContent>
    </Tabs>
  );
}
