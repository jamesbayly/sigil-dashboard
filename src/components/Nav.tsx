import { Link, Outlet, useLocation } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Nav() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to determine if a route is active
  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (location.pathname === "/" && path === "/open")
    );
  };

  const navLinks = [
    { to: "/open", label: "Open" },
    { to: "/history", label: "History" },
    { to: "/strategies", label: "Strategies" },
    { to: "/tests", label: "Test Runs" },
    { to: "/symbols", label: "Symbols" },
    { to: "/options", label: "Options" },
    { to: "/news", label: "News" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-end justify-between px-4 pt-4">
          <h1 className="text-2xl font-bold">Sigil Trading Dashboard</h1>
          <nav className="flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <DarkModeToggle />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-3">
            <h1 className="text-lg sm:text-xl font-bold truncate flex-1">
              Sigil Trading
            </h1>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <nav className="flex flex-col border-t border-gray-200 dark:border-gray-700">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b border-gray-200 dark:border-gray-700 ${
                    isActive(link.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-grow p-3 sm:p-4 md:p-6 pt-4 sm:pt-6 md:pt-8">
        {/* Content will be rendered by React Router */}
        <Outlet />
      </main>
    </div>
  );
}
