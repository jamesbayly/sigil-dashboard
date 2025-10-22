import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NewsSentiment,
  type NewsParsedResponse,
  type SymbolsResponse,
} from "@/types";
import SymbolPopover from "./SymbolPopover";

interface ParsedNewsListProps {
  parsedItems: NewsParsedResponse[];
  symbols: SymbolsResponse[];
  title?: string;
}

export default function ParsedNewsList({
  parsedItems,
  symbols,
  title,
}: ParsedNewsListProps) {
  const getSentimentColor = (sentiment: NewsSentiment) => {
    switch (sentiment) {
      case "VERY_POSITIVE":
        return "bg-green-50 text-green-700 dark:bg-green-800 dark:text-green-300";
      case "POSITIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "VERY_NEGATIVE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "NEGATIVE":
        return "bg-red-50 text-red-700 dark:bg-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (parsedItems.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No parsed news items found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-2xl font-bold">
          {title} ({parsedItems.length})
        </h2>
      )}
      <div className="grid gap-4">
        {parsedItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              {item.symbol_id ? (
                <span className="text-sm text-muted-foreground">
                  <SymbolPopover
                    symbolId={item.symbol_id}
                    symbol={symbols.find((s) => s.id === item.symbol_id)}
                  />
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  GENERAL NEWS
                </span>
              )}
              <Badge
                className={getSentimentColor(item.sentiment)}
                variant="outline"
              >
                {item.sentiment}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.content}</p>
              {item.source_link && (
                <a
                  href={item.source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                >
                  Source
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
