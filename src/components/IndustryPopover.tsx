import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { IndustryTags } from "@/types";
import { Link } from "react-router-dom";
import { useIndustry } from "@/hooks/useIndustry";

interface IndustryPopoverProps {
  industry: IndustryTags;
  className?: string;
}

export default function IndustryPopover({
  industry,
  className = "",
}: IndustryPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { industry: fullIndustry, isLoading } = useIndustry(
    isOpen ? industry.id : undefined,
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Badge variant="secondary" className={`cursor-pointer ${className}`}>
          {industry.name}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ) : fullIndustry ? (
          <div className="space-y-4">
            {/* Header with industry name */}
            <div>
              <Link
                to={`/industries/${fullIndustry.id}`}
                className="font-semibold text-lg underline cursor-pointer"
              >
                {fullIndustry.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                ID: #{fullIndustry.id}
              </p>
            </div>

            {/*Performance*/}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Cap:</span>
                <span className="text-sm">
                  {fullIndustry.market_cap
                    ? `$${fullIndustry.market_cap.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}M`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Day Change:</span>
                <span
                  className={`text-sm ${
                    fullIndustry.day_change_percent
                      ? fullIndustry.day_change_percent > 0
                        ? "text-green-600"
                        : fullIndustry.day_change_percent < 0
                          ? "text-red-600"
                          : ""
                      : ""
                  }`}
                >
                  {fullIndustry.day_change_percent !== undefined
                    ? `${fullIndustry.day_change_percent > 0 ? "+" : ""}${fullIndustry.day_change_percent.toFixed(2)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Change:</span>
                <span
                  className={`text-sm ${
                    fullIndustry.week_change_percent
                      ? fullIndustry.week_change_percent > 0
                        ? "text-green-600"
                        : fullIndustry.week_change_percent < 0
                          ? "text-red-600"
                          : ""
                      : ""
                  }`}
                >
                  {fullIndustry.week_change_percent !== undefined
                    ? `${fullIndustry.week_change_percent > 0 ? "+" : ""}${fullIndustry.week_change_percent.toFixed(2)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Change:</span>
                <span
                  className={`text-sm ${
                    fullIndustry.month_change_percent
                      ? fullIndustry.month_change_percent > 0
                        ? "text-green-600"
                        : fullIndustry.month_change_percent < 0
                          ? "text-red-600"
                          : ""
                      : ""
                  }`}
                >
                  {fullIndustry.month_change_percent !== undefined
                    ? `${fullIndustry.month_change_percent > 0 ? "+" : ""}${fullIndustry.month_change_percent.toFixed(2)}%`
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-2 border-t pt-4">
              {fullIndustry.symbols && fullIndustry.symbols.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Symbols:</span>
                  <span className="text-sm">{fullIndustry.symbols.length}</span>
                </div>
              )}

              {fullIndustry.news && fullIndustry.news.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">News Items:</span>
                  <span className="text-sm">{fullIndustry.news.length}</span>
                </div>
              )}

              {fullIndustry.related_industry_tags &&
                fullIndustry.related_industry_tags.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Related Industries:
                    </span>
                    <span className="text-sm">
                      {fullIndustry.related_industry_tags.length}
                    </span>
                  </div>
                )}
            </div>

            {/* Related Industries */}
            {fullIndustry.related_industry_tags &&
              fullIndustry.related_industry_tags.length > 0 && (
                <div className="border-t pt-4">
                  <span className="text-sm font-medium block mb-2">
                    Related Industries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {fullIndustry.related_industry_tags
                      .slice(0, 5)
                      .map((relatedTag) => (
                        <IndustryPopover
                          key={relatedTag.id}
                          industry={relatedTag}
                          className="text-xs"
                        />
                      ))}
                    {fullIndustry.related_industry_tags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{fullIndustry.related_industry_tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

            {/* Top Symbols */}
            {fullIndustry.symbols && fullIndustry.symbols.length > 0 && (
              <div className="border-t pt-4">
                <span className="text-sm font-medium block mb-2">
                  Top Symbols:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {fullIndustry.symbols.slice(0, 5).map((symbol) => (
                    <Badge
                      key={symbol.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {symbol.symbol}
                    </Badge>
                  ))}
                  {fullIndustry.symbols.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{fullIndustry.symbols.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Failed to load industry details
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
