import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

export function scoreColor(score: number | null): string {
  if (!score) return "text-muted-foreground"
  if (score >= 4.5) return "text-chart-2"
  if (score >= 4.0) return "text-chart-1"
  if (score >= 3.5) return "text-chart-3"
  return "text-destructive"
}

export function scoreBg(score: number | null): string {
  if (!score) return "bg-muted"
  if (score >= 4.5) return "bg-chart-2/15"
  if (score >= 4.0) return "bg-chart-1/15"
  if (score >= 3.5) return "bg-chart-3/15"
  return "bg-destructive/15"
}

export function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Applied":
    case "Interview":
    case "Offer":
      return "default"
    case "Rejected":
    case "Discarded":
      return "destructive"
    case "SKIP":
      return "outline"
    default:
      return "secondary"
  }
}

export const CANONICAL_STATUSES = [
  "Evaluated",
  "Applied",
  "Responded",
  "Interview",
  "Offer",
  "Rejected",
  "Discarded",
  "SKIP",
] as const
