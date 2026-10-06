"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
export type SearchRecord = { href: string; title: string; description: string };
const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
export function GuideSearch({ items }: { items: SearchRecord[] }) {
  const initial = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get("q") || "",
    () => "",
  );
  const [draft, setDraft] = useState<string | null>(null);
  const query = draft ?? initial;
  const normal = query.trim().toLocaleLowerCase("en-GB");
  const results = items.filter((item) =>
    (item.title + " " + item.description)
      .toLocaleLowerCase("en-GB")
      .includes(normal),
  );
  return (
    <section>
      <form action="/search/" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="guide-query">Search Forever guides and classes</label>
        <div className="search-controls">
          <input
            id="guide-query"
            type="search"
            name="q"
            value={query}
            onChange={(event) => {
              setDraft(event.target.value);
              const url = new URL(window.location.href);
              if (event.target.value)
                url.searchParams.set("q", event.target.value);
              else url.searchParams.delete("q");
              window.history.replaceState(null, "", url);
            }}
            placeholder="Try talents, Skyborne or coming from Retail"
          />
          <button
            type="button"
            className="wow-cta secondary"
            onClick={() => {
              setDraft("");
              window.history.replaceState(null, "", "/search/");
            }}
          >
            Clear search
          </button>
        </div>
      </form>
      <p role="status">
        {results.length} {results.length === 1 ? "guide" : "guides"}{" "}
        {normal ? "found" : "available"}
      </p>
      <div className="card-grid">
        {results.map((item) => (
          <Link className="guide-card" href={item.href} key={item.href}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span>Read guide →</span>
          </Link>
        ))}
      </div>
      {!results.length && (
        <p>
          No guide matches that search. Try a class name or a shorter phrase.
        </p>
      )}
    </section>
  );
}
