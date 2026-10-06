export const launchInstant = "2026-11-04T23:00:00Z";
export function remainingTime(now: number, target = Date.parse(launchInstant)) {
  const remaining = Math.max(0, target - now);
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    launched: remaining === 0,
  };
}
