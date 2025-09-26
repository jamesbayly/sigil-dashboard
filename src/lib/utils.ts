import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function returns tailwind styling for a given number based on the input number and the median value.
// It returns a darker green for values far above the median, a lighter green for values slightly above the median,
export function getNumberStyling(
  number: number | undefined,
  median: number = 0
) {
  if (number === undefined) return "text-gray-600";

  if (number > median) return "text-green-600";
  if (number < median) return "text-red-600";
  return "text-grey-600";
}
