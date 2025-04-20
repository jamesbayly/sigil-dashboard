import TabsView from "@/components/TabsView";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold">Sigil Trading Dashboard</h1>
        <DarkModeToggle />
      </header>
      <main className="p-4">
        <TabsView />
      </main>
    </div>
  );
}
