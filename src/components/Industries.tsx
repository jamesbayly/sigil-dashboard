import { useIndustries } from "@/hooks/useIndustries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { IndustryTags } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type TreemapIndustry = {
  id: number;
  name: string;
  theme: string;
  marketCap: number;
  treemapSize: number;
  dayChange: number;
  weekChange: number;
  monthChange: number;
  changePercent: number;
};

type ChangeRange = "day" | "week" | "month";

const MIN_TREEMAP_SIZE = 3;

const toTreemapSize = (marketCap: number) => {
  const safeMarketCap = Math.max(marketCap, 0);
  const logSize = Math.log10(safeMarketCap + 1);
  return Math.max(logSize, MIN_TREEMAP_SIZE);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const interpolateColor = (
  start: [number, number, number],
  end: [number, number, number],
  ratio: number,
) => {
  const clampedRatio = clamp(ratio, 0, 1);
  const red = Math.round(start[0] + (end[0] - start[0]) * clampedRatio);
  const green = Math.round(start[1] + (end[1] - start[1]) * clampedRatio);
  const blue = Math.round(start[2] + (end[2] - start[2]) * clampedRatio);
  return `rgb(${red}, ${green}, ${blue})`;
};

const changeToColor = (changePercent: number) => {
  const normalized = clamp(changePercent / 15, -1, 1);

  const darkRed: [number, number, number] = [127, 29, 29];
  const lightRed: [number, number, number] = [248, 113, 113];
  const white: [number, number, number] = [255, 255, 255];
  const lightGreen: [number, number, number] = [74, 222, 128];
  const darkGreen: [number, number, number] = [21, 128, 61];

  if (normalized < -0.5) {
    const ratio = (normalized + 1) / 0.5;
    return interpolateColor(darkRed, lightRed, ratio);
  }

  if (normalized < 0) {
    const ratio = (normalized + 0.5) / 0.5;
    return interpolateColor(lightRed, white, ratio);
  }

  if (normalized < 0.5) {
    const ratio = normalized / 0.5;
    return interpolateColor(white, lightGreen, ratio);
  }

  const ratio = (normalized - 0.5) / 0.5;
  return interpolateColor(lightGreen, darkGreen, ratio);
};

const formatPercent = (value: number) => {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
};

const getChangeLabel = (changeRange: ChangeRange) => {
  if (changeRange === "week") {
    return "7d";
  }

  if (changeRange === "month") {
    return "30d";
  }

  return "24h";
};

const TreemapContent = (props: {
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  changePercent?: number;
}) => {
  const { depth, x, y, width, height, name, changePercent } = props;

  if (
    depth === 0 ||
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return null;
  }

  const resolvedDayChange =
    typeof changePercent === "number" ? changePercent : 0;
  const resolvedName = name || "Industry";

  const canShowName = width > 80 && height > 30;
  const canShowPercent = width > 70 && height > 48;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={changeToColor(resolvedDayChange)}
        stroke="hsl(var(--border))"
        strokeWidth={1}
        rx={4}
      />
      {canShowName && (
        <text x={x + 8} y={y + 18} fill="black" fontSize={12} fontWeight={600}>
          {resolvedName}
        </text>
      )}
      {canShowPercent && (
        <text
          x={x + 8}
          y={y + (canShowName ? 36 : 20)}
          fill="black"
          fontSize={12}
          fontWeight={700}
        >
          {formatPercent(resolvedDayChange)}
        </text>
      )}
    </g>
  );
};

export default function Industries() {
  const navigate = useNavigate();
  const location = useLocation();
  const { industries, isLoading, error } = useIndustries();
  const [searchQuery, setSearchQuery] = useState("");
  const [changeRange, setChangeRange] = useState<ChangeRange>("day");

  const activeTab = location.pathname.endsWith("/map") ? "map" : "list";

  const treemapIndustries = useMemo<TreemapIndustry[]>(
    () =>
      industries
        .filter((industry) => (industry.market_cap || 0) > 0)
        .map((industry) => {
          const dayChange = industry.day_change_percent || 0;
          const weekChange = industry.week_change_percent || 0;
          const monthChange = industry.month_change_percent || 0;

          let changePercent = dayChange;
          if (changeRange === "week") {
            changePercent = weekChange;
          }
          if (changeRange === "month") {
            changePercent = monthChange;
          }

          return {
            id: industry.id,
            name: industry.name,
            theme: industry.theme,
            marketCap: industry.market_cap || 0,
            treemapSize: toTreemapSize(industry.market_cap || 0),
            dayChange,
            weekChange,
            monthChange,
            changePercent,
          };
        }),
    [industries, changeRange],
  );

  const filteredIndustries = industries.filter(
    (industry) =>
      industry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      industry.id.toString().includes(searchQuery),
  );

  const columns: ColumnDef<IndustryTags>[] = [
    {
      accessorKey: "theme",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Theme
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.theme}</div>;
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "market_cap",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Market Cap (M)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-lg font-mono">
            {row.original.market_cap
              ? `$${row.original.market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "day_change_percent",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            24h %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const change = row.original.day_change_percent || 0;
        const colorClass = change >= 0 ? "text-green-600" : "text-red-600";
        return (
          <div className={`text-lg font-mono ${colorClass}`}>
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        );
      },
    },
    {
      accessorKey: "week_change_percent",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            7d %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const change = row.original.week_change_percent || 0;
        const colorClass = change >= 0 ? "text-green-600" : "text-red-600";
        return (
          <div className={`text-lg font-mono ${colorClass}`}>
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">Industries</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => navigate(`/industries/${value}`)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Industry Tags</CardTitle>
              <div className="mt-4">
                <Input
                  placeholder="Search industries by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="text-center py-8">Loading industries...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-600">
                  Error: {error.message}
                </div>
              )}
              {!isLoading && !error && (
                <>
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {filteredIndustries.length} industr
                    {filteredIndustries.length !== 1 ? "ies" : "y"}
                    {searchQuery && ` (filtered from ${industries.length})`}
                  </div>
                  <DataTable
                    data={filteredIndustries}
                    columns={columns}
                    onRowClick={(row) => navigate(`/industries/${row.id}`)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Industry Market Map</CardTitle>
              <div className="text-sm text-muted-foreground">
                Square size represents market cap. Color and value represent the
                selected change period.
              </div>
              <div className="mt-3">
                <ToggleGroup
                  type="single"
                  value={changeRange}
                  onValueChange={(value: ChangeRange | "") => {
                    if (value) {
                      setChangeRange(value);
                    }
                  }}
                >
                  <ToggleGroupItem value="day" aria-label="Show 24 hour change">
                    24h
                  </ToggleGroupItem>
                  <ToggleGroupItem value="week" aria-label="Show 7 day change">
                    7d
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="month"
                    aria-label="Show 30 day change"
                  >
                    30d
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="text-center py-8">Loading industries...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-600">
                  Error: {error.message}
                </div>
              )}
              {!isLoading && !error && treemapIndustries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No industries with market cap data available for this view.
                </div>
              )}
              {!isLoading && !error && treemapIndustries.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                    <span>-{getChangeLabel(changeRange)} %</span>
                    <div
                      className="w-48 h-2 rounded"
                      style={{
                        background:
                          "linear-gradient(to right, rgb(127,29,29) 0%, rgb(248,113,113) 25%, rgb(255,255,255) 50%, rgb(74,222,128) 75%, rgb(21,128,61) 100%)",
                      }}
                    />
                    <span>+{getChangeLabel(changeRange)} %</span>
                  </div>
                  <div className="w-full h-[70vh] min-h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap
                        data={treemapIndustries}
                        dataKey="treemapSize"
                        stroke="hsl(var(--border))"
                        fill="hsl(var(--muted))"
                        isAnimationActive={false}
                        content={<TreemapContent />}
                        onClick={(data) => {
                          if (data && typeof data.id === "number") {
                            navigate(`/industries/${data.id}`);
                          }
                        }}
                      >
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) {
                              return null;
                            }

                            const industry = payload[0]
                              .payload as TreemapIndustry;

                            return (
                              <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-md">
                                <div className="font-medium">
                                  {industry.theme} - {industry.name}
                                </div>
                                <div className="text-muted-foreground">
                                  Market Cap: $
                                  {industry.marketCap.toLocaleString(
                                    undefined,
                                    {
                                      maximumFractionDigits: 0,
                                    },
                                  )}
                                  M
                                </div>
                                <div className="text-muted-foreground">
                                  {getChangeLabel(changeRange)}:{" "}
                                  {formatPercent(industry.changePercent)}
                                </div>
                              </div>
                            );
                          }}
                        />
                      </Treemap>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
