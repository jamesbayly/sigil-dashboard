import { Link, Outlet, useLocation } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";

export default function Nav() {
  const location = useLocation();

  // Helper function to determine if a route is active
  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (location.pathname === "/" && path === "/open")
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-end justify-between px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold">Sigil Trading Dashboard</h1>
        <nav className="flex">
          <Link
            to="/open"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/open")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Open
          </Link>
          <Link
            to="/history"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/history")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            History
          </Link>
          <Link
            to="/strategies"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/strategies")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Strategies
          </Link>
          <Link
            to="/tests"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/tests")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Test Runs
          </Link>
          <Link
            to="/symbols"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/symbols")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Symbols
          </Link>
          <Link
            to="/options"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/options")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Options
          </Link>
          <Link
            to="/news"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/news")
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            News
          </Link>
        </nav>
        <DarkModeToggle />
      </header>
      <main className="flex-grow p-4 pt-8">
        {/* Content will be rendered by React Router */}
        <Outlet />
      </main>
    </div>
  );
}
