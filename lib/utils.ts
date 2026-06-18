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

export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function scoreColor(score: number | null): string {
  if (!score) return "text-muted-foreground"
  if (score >= 4.5) return "text-emerald-600"
  if (score >= 4.0) return "text-blue-600"
  if (score >= 3.5) return "text-amber-600"
  return "text-destructive"
}

export function scoreBg(score: number | null): string {
  if (!score) return "bg-muted"
  if (score >= 4.5) return "bg-emerald-600/10"
  if (score >= 4.0) return "bg-blue-600/10"
  if (score >= 3.5) return "bg-amber-600/10"
  return "bg-destructive/10"
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
