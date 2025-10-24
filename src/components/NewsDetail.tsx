import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNewsItem } from "@/hooks/useNewsItem";
import { useSymbols } from "@/hooks/useSymbols";
import { NewsType, type NewsRequest } from "@/types";
import { cn } from "@/lib/utils";
import SymbolSelector from "./SymbolSelector";
import ParsedNewsList from "./ParsedNewsList";

// Zod schema for news form
const newsSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.nativeEnum(NewsType),
  symbol_id: z.number().optional().nullable(),
  source_link: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Source link is required"),
  content: z.string().min(1, "Content is required"),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export default function NewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const newsId = id ? parseInt(id, 10) : undefined;
  const {
    newsItem,
    create,
    update,
    deleteItem,
    isLoading: newsLoading,
  } = useNewsItem(newsId);
  const { symbols } = useSymbols();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!id;

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: NewsType.INTRADAY_OPTIONS,
      symbol_id: undefined,
      source_link: "",
      content: "",
    },
  });

  const onSubmit = async (values: NewsFormValues) => {
    setIsSaving(true);
    try {
      const newsData: NewsRequest = {
        date: new Date(values.date + "T00:00:00.000Z"), // Force UTC at midnight
        type: values.type,
        symbol_id: values.symbol_id || undefined,
        source_link: values.source_link,
        content: values.content,
      };

      let result;
      if (isEdit && newsItem) {
        result = await update({
          id: newsItem.id,
          ...newsData,
          parsed_items: newsItem.parsed_items,
        });
      } else {
        result = await create(newsData);
      }

      if (result) {
        form.reset();
        navigate(`/news/${result.id}`);
      }
    } catch (error) {
      console.error("Failed to save news:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!newsItem) return;

    setIsDeleting(true);
    const success = await deleteItem(newsItem.id);
    setIsDeleting(false);

    if (success) {
      navigate("/news");
    }
  };

  const handleCancel = () => {
    navigate("/news");
  };

  // Reset form when newsItem changes
  useEffect(() => {
    if (newsItem) {
      form.reset({
        date: new Date(newsItem.date).toISOString().split("T")[0],
        type: newsItem.type,
        symbol_id: newsItem.symbol_id,
        source_link: newsItem.source_link,
        content: newsItem.content,
      });
    } else if (!isEdit) {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        type: NewsType.INTRADAY_OPTIONS,
        symbol_id: undefined,
        source_link: "",
        content: "",
      });
    }
  }, [newsItem, form, isEdit]);

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {isEdit
                ? newsLoading
                  ? "Edit News: Loading..."
                  : newsItem
                  ? `Edit News: #${newsItem.id}`
                  : "Edit News: Not Found"
                : "Create New News"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit
                ? "Update the news information below"
                : "Add a new news item to the system"}
            </p>
          </div>
        </div>

        {/* Delete Button (only show when editing) */}
        {isEdit && newsItem && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete News Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this news item? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid gap-6">
        {/* Main Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>News Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>News Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select news type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PREMARKET">
                                Premarket
                              </SelectItem>
                              <SelectItem value="INTRADAY_OPTIONS">
                                Intraday Options
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name="symbol_id"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol (Optional)</FormLabel>
                      <FormControl>
                        <SymbolSelector
                          value={field.value || undefined}
                          onChange={field.onChange}
                          showLabel={false}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty if news is not specific to a symbol
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="source_link"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/article"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to the original news source
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="content"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm"
                          placeholder="Enter news content here..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The main content of the news article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving
                      ? isEdit
                        ? "Updating..."
                        : "Creating..."
                      : isEdit
                      ? "Update News"
                      : "Create News"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Parsed Items Section (only show when editing and has parsed items) */}
        {newsItem &&
          newsItem.parsed_items &&
          newsItem.parsed_items.length > 0 && (
            <ParsedNewsList
              parsedItems={newsItem.parsed_items}
              symbols={symbols}
              title="Parsed News Items"
            />
          )}
      </div>
    </div>
  );
}
