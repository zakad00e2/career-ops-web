const GREETING_NAME_FALLBACK = 'صديقي';

export function greetingName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] || GREETING_NAME_FALLBACK;
}
