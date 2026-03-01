import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIndustry } from "@/hooks/useIndustry";
import { Badge } from "./ui/badge";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SymbolsResponse, IndustryTags } from "@/types";
import IndustryPopover from "./IndustryPopover";
import ParsedNewsList from "./ParsedNewsList";

export default function Industry() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const industryId = id ? parseInt(id, 10) : undefined;
  const { industry, isLoading } = useIndustry(industryId);

  const handleBack = () => {
    navigate("/industries");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading industry details...</div>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="space-y-6">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Industries
        </Button>
        <div className="text-center py-8 text-red-600">Industry not found</div>
      </div>
    );
  }

  const symbolColumns: ColumnDef<SymbolsResponse>[] = [
    {
      accessorKey: "symbol",
      header: "Symbol",
      cell: ({ row }) => {
        return (
          <div
            className="font-mono font-semibold cursor-pointer hover:underline"
            onClick={() => navigate(`/symbols/${row.original.id}`)}
          >
            {row.original.symbol}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <div className="max-w-xs truncate">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "symbol_type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="capitalize">
            {row.original.symbol_type.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "market_cap",
      header: "Market Cap (M)",
      cell: ({ row }) => {
        const marketCap = row.original.market_cap;
        return (
          <div className="text-right font-mono">
            {marketCap
              ? `$${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "day_change_percent",
      header: "24h %",
      cell: ({ row }) => {
        const change = row.original.day_change_percent ?? 0;
        const colorClass = change > 0 ? "text-green-600" : "text-red-600";
        return (
          <div className={`text-right font-mono ${colorClass}`}>
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Button onClick={handleBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Industries
      </Button>

      {/* Industry Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mb-2">{industry.name}</CardTitle>
          <CardDescription>{industry.theme}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{industry.description}</p>
        </CardContent>
      </Card>

      {/* Industry Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded">
              <div className="text-sm text-muted-foreground">
                Market Cap (M)
              </div>
              <div className="text-lg font-mono">
                {industry.market_cap
                  ? `$${industry.market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : "N/A"}
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm text-muted-foreground">24h Change %</div>
              <div
                className={`text-lg font-mono ${
                  (industry.day_change_percent || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(industry.day_change_percent || 0) > 0 ? "+" : ""}
                {industry.day_change_percent
                  ? industry.day_change_percent.toFixed(2) + "%"
                  : "N/A"}
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm text-muted-foreground">7d Change %</div>
              <div
                className={`text-lg font-mono ${
                  (industry.week_change_percent || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(industry.week_change_percent || 0) > 0 ? "+" : ""}
                {industry.week_change_percent
                  ? industry.week_change_percent.toFixed(2) + "%"
                  : "N/A"}
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm text-muted-foreground">30d Change %</div>
              <div
                className={`text-lg font-mono ${
                  (industry.month_change_percent || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(industry.month_change_percent || 0) > 0 ? "+" : ""}
                {industry.month_change_percent
                  ? industry.month_change_percent.toFixed(2) + "%"
                  : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Industries */}
      {industry.related_industry_tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Related Industries ({industry.related_industry_tags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {industry.related_industry_tags.map((tag: IndustryTags) => (
                <IndustryPopover key={tag.id} industry={tag} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symbols */}
      <Card>
        <CardHeader>
          <CardTitle>Symbols ({industry.symbols.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {industry.symbols.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No symbols found for this industry
            </div>
          ) : (
            <DataTable data={industry.symbols} columns={symbolColumns} />
          )}
        </CardContent>
      </Card>

      {/* News */}
      <Card>
        <CardHeader>
          <CardTitle>Related News ({industry.news.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {industry.news.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No news found for this industry
            </div>
          ) : (
            <ParsedNewsList
              parsedItems={industry.news}
              symbols={industry.symbols}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
