"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { remainingTime } from "./countdown";
export function LaunchCountdown() {
  const [time, setTime] = useState<ReturnType<typeof remainingTime> | null>(
    null,
  );
  useEffect(() => {
    const update = () => setTime(remainingTime(Date.now()));
    update();
    const id = window.setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="wow-countdown" aria-labelledby="countdown-title">
      <div className="wow-count-copy">
        <h2 id="countdown-title">WoW Forever launch countdown</h2>
        <p>
          4 November 2026 · 23:00 UK / UTC ·{" "}
          <Link href="/launch/#section-0">Source and timezone note</Link>
        </p>
        <Link className="wow-count-link" href="/launch/">
          Get ready for launch: explore what’s changed →
        </Link>
      </div>
      {time?.launched ? (
        <p>
          The announced launch time has arrived. Check Blizzard for current
          availability.
        </p>
      ) : (
        <div
          className="wow-clock"
          aria-label={
            time
              ? `${time.days} days, ${time.hours} hours, ${time.minutes} minutes until the announced launch`
              : "Launch: 4 November 2026 at 23:00 UTC"
          }
        >
          {[
            ["DAYS", time?.days],
            ["HOURS", time?.hours],
            ["MINUTES", time?.minutes],
          ].map(([label, value]) => (
            <span key={label}>
              <strong>{value ?? "—"}</strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
