import { useIndustries } from "@/hooks/useIndustries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IndustryTags } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

export default function Industries() {
  const navigate = useNavigate();
  const { industries, isLoading, error } = useIndustries();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIndustries = industries.filter(
    (industry) =>
      industry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      industry.id.toString().includes(searchQuery),
  );

  const columns: ColumnDef<IndustryTags>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Industry Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-center font-mono">{row.original.id}</div>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold">Industries</h2>
      </div>

      {/* Industries Table */}
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
    </div>
  );
}
