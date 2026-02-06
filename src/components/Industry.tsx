import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIndustry } from "@/hooks/useIndustry";
import { Badge } from "./ui/badge";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SymbolsResponse, NewsParsedResponse, IndustryTags } from "@/types";
import IndustryPopover from "./IndustryPopover";

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
            {marketCap ? `$${marketCap.toLocaleString()}` : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "day_change_percent",
      header: "24h %",
      cell: ({ row }) => {
        const change = row.original.day_change_percent;
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

  const newsColumns: ColumnDef<NewsParsedResponse>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {new Date(row.original.date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        return (
          <div className="max-w-md truncate text-sm">
            {row.original.content}
          </div>
        );
      },
    },
    {
      accessorKey: "sentiment",
      header: "Sentiment",
      cell: ({ row }) => {
        const sentiment = row.original.sentiment;
        const colorMap = {
          VERY_POSITIVE: "bg-green-600 text-white",
          POSITIVE:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          NEUTRAL:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          NEGATIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          VERY_NEGATIVE: "bg-red-600 text-white",
        };
        return (
          <Badge variant="outline" className={colorMap[sentiment]}>
            {sentiment.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="capitalize">
            {row.original.type.replace("_", " ").toLowerCase()}
          </Badge>
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{industry.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">ID: {industry.id}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
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
            <DataTable data={industry.news} columns={newsColumns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
