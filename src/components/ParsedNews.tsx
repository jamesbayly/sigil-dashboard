import { useState, useMemo } from "react";
import { useParsedNews } from "@/hooks/useParsedNews";
import { useSymbols } from "@/hooks/useSymbols";
import { useIndustries } from "@/hooks/useIndustries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NewsType, NewsParsedResponse } from "@/types";
import ParsedNewsList from "./ParsedNewsList";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "24h" | "3d" | "7d" | "all";

export default function ParsedNews() {
  const [typeFilter, setTypeFilter] = useState<NewsType | undefined>();
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>();
  const [industryFilter, setIndustryFilter] = useState<number | undefined>();
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const {
    parsedNews,
    isLoading,
    error,
    assetNewsPagination,
    setPage,
    setLimit,
    setSearch,
  } = useParsedNews(symbolFilter, typeFilter);
  const { symbols } = useSymbols();
  const { industries } = useIndustries();

  // Filter news by time range
  const filterByTimeRange = useMemo(() => {
    return (items: NewsParsedResponse[]) => {
      if (timeRange === "all") return items;

      const now = new Date();
      const cutoffTime = new Date();

      switch (timeRange) {
        case "24h":
          cutoffTime.setHours(now.getHours() - 24);
          break;
        case "3d":
          cutoffTime.setDate(now.getDate() - 3);
          break;
        case "7d":
          cutoffTime.setDate(now.getDate() - 7);
          break;
      }

      return items.filter((item) => new Date(item.date) >= cutoffTime);
    };
  }, [timeRange]);

  // Filter news by industry tag
  const filterByIndustry = useMemo(() => {
    return (items: NewsParsedResponse[]) => {
      if (!industryFilter) return items;
      return items.filter((item) =>
        item.industry_tags?.some((tag) => tag.id === industryFilter),
      );
    };
  }, [industryFilter]);

  const filteredParsedNews = useMemo(() => {
    let filtered = parsedNews;
    filtered = filterByTimeRange(filtered);
    filtered = filterByIndustry(filtered);
    return filtered;
  }, [parsedNews, filterByTimeRange, filterByIndustry]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">Parsed News</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="w-full sm:w-auto">
              <Label>Time Range</Label>
              <Select
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as TimeRange)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="3d">Last 3 Days</SelectItem>
                  <SelectItem value="7d">Last Week</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) =>
                  setTypeFilter(v === "ALL" ? undefined : (v as NewsType))
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="PREMARKET">Premarket</SelectItem>
                  <SelectItem value="GENERAL_NEWS">General News</SelectItem>
                  <SelectItem value="NOTABLE_OPTIONS">
                    Notable Options
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Label>Symbol</Label>
              <Popover open={symbolOpen} onOpenChange={setSymbolOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={symbolOpen}
                    className="w-full sm:w-[200px] justify-between"
                  >
                    {symbolFilter
                      ? symbols.find((s) => s.id === symbolFilter)?.symbol
                      : "All Symbols"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search symbol..." />
                    <CommandList>
                      <CommandEmpty>No symbol found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all-symbols"
                          onSelect={() => {
                            setSymbolFilter(undefined);
                            setSymbolOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !symbolFilter ? "opacity-100" : "opacity-0",
                            )}
                          />
                          All Symbols
                        </CommandItem>
                        {symbols
                          .sort((a, b) => a.symbol.localeCompare(b.symbol))
                          .map((symbol) => (
                            <CommandItem
                              key={symbol.id}
                              value={symbol.symbol}
                              onSelect={() => {
                                setSymbolFilter(symbol.id);
                                setSymbolOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  symbolFilter === symbol.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {symbol.symbol}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full sm:w-auto">
              <Label>Industry</Label>
              <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={industryOpen}
                    className="w-full sm:w-[600px] justify-between"
                  >
                    {industryFilter
                      ? industries.find((i) => i.id === industryFilter)?.name
                      : "All Industries"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[800px] p-0">
                  <Command>
                    <CommandInput placeholder="Search industry..." />
                    <CommandList>
                      <CommandEmpty>No industry found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all-industries"
                          onSelect={() => {
                            setIndustryFilter(undefined);
                            setIndustryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !industryFilter ? "opacity-100" : "opacity-0",
                            )}
                          />
                          All Industries
                        </CommandItem>
                        {industries
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((industry) => (
                            <CommandItem
                              key={industry.id}
                              value={industry.name}
                              onSelect={() => {
                                setIndustryFilter(industry.id);
                                setIndustryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  industryFilter === industry.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {industry.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full sm:w-auto">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search news..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearch(searchInput)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parsed News Content */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Loading parsed news...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {filteredParsedNews.length > 0 && (
            <ParsedNewsList
              parsedItems={filteredParsedNews}
              symbols={symbols}
              title="Asset News"
              pagination={assetNewsPagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}

          {filteredParsedNews.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No parsed news items found for the selected filters.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
