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
import { Label } from "@/components/ui/label";
import { NewsType, NewsParsedResponse } from "@/types";
import ParsedNewsList from "./ParsedNewsList";

type TimeRange = "24h" | "3d" | "7d" | "all";

export default function ParsedNews() {
  const [typeFilter, setTypeFilter] = useState<NewsType | undefined>();
  const [symbolFilter, setSymbolFilter] = useState<number | undefined>();
  const [industryFilter, setIndustryFilter] = useState<number | undefined>();
  const [timeRange, setTimeRange] = useState<TimeRange>("3d");
  const { parsedNews, isLoading, error } = useParsedNews(
    symbolFilter,
    typeFilter
  );
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
        item.industry_tags?.some((tag) => tag.id === industryFilter)
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
              <Select
                value={symbolFilter?.toString()}
                onValueChange={(v) =>
                  setSymbolFilter(v === "ALL" ? undefined : Number(v))
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Symbols" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Symbols</SelectItem>
                  {symbols
                    .sort((a, b) => a.symbol.localeCompare(b.symbol))
                    .map((symbol) => (
                      <SelectItem key={symbol.id} value={symbol.id.toString()}>
                        {symbol.symbol}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Label>Industry</Label>
              <Select
                value={industryFilter?.toString()}
                onValueChange={(v) =>
                  setIndustryFilter(v === "ALL" ? undefined : Number(v))
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Industries</SelectItem>
                  {industries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((industry) => (
                      <SelectItem
                        key={industry.id}
                        value={industry.id.toString()}
                      >
                        {industry.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
