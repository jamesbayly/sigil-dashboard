import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function returns tailwind styling for a given number based on the input number and the median value.
// It returns a darker green for values far above the median, a lighter green for values slightly above the median,
export const getNumberStyling = (
  number: number | undefined,
  median: number = 0,
) => {
  if (number === undefined) return "text-gray-600";

  if (number > median) return "text-green-600";
  if (number < median) return "text-red-600";
  return "text-grey-600";
};

export const exportCSV = (
  fileName: string,
  header: string,
  data: unknown[][],
) => {
  const csvContent =
    `data:text/csv;charset=utf-8,${header}\n` +
    data.map((d) => d.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
};
