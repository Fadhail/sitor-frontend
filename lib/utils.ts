import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmotionColor(emotion: string) {
  switch (emotion?.toLowerCase()) {
    case "happy":
      return "bg-green-500";
    case "sad":
      return "bg-blue-500";
    case "angry":
      return "bg-red-500";
    case "fearful":
      return "bg-purple-500";
    case "disgusted":
      return "bg-yellow-500";
    case "surprised":
      return "bg-pink-500";
    case "neutral":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}
