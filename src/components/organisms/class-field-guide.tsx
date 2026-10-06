import type { ClassFieldGuide } from "@/types/content";
export function ClassGuideDetail({
  guide,
  comparisonNote,
  updated,
  build,
}: {
  guide: ClassFieldGuide;
  comparisonNote: string;
  updated: string;
  build: string;
}) {
  return (
    <>
      <section className="article-section">
        <h2>What has changed?</h2>
        <p>{guide.summary}</p>
        <p className="wow-guide-meta">
          Guide reviewed {updated} · Reference beta build {build}
        </p>
        {guide.changes.map((change) => (
          <section key={change.title}>
            <h3>{change.title}</h3>
            <p>{change.body}</p>
            <p className="evidence-note">Evidence: {change.evidence}</p>
          </section>
        ))}
        <details className="comparison-note">
          <summary>How we compare versions</summary>
          <p>{comparisonNote}</p>
        </details>
      </section>
      <section className="article-section">
        <h2>Get familiar with your trees</h2>
        <div className="card-grid">
          {guide.treeFocus.map((tree) => (
            <article className="guide-card" key={tree.tree}>
              <h3>{tree.tree}</h3>
              <p>{tree.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="article-section">
        <h2>Returning from Vanilla or Classic</h2>
        <p>{guide.fromVanilla}</p>
        <h2>Coming from Retail</h2>
        <p>{guide.fromRetail}</p>
      </section>
      <section className="article-section">
        <h2>Try this before your first group</h2>
        <ul>
          {guide.practice.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>
      <section className="wow-sources">
        <h2>Class guide evidence</h2>
        {guide.sources.map((url) => (
          <a key={url} href={url}>
            {new URL(url).hostname.includes("blizzard")
              ? "Blizzard class preview"
              : url.includes("changes")
                ? "Maintained beta comparison"
                : url.includes("developers")
                  ? "Maintained talent dataset and licence"
                  : "Maintained class spellbook"}{" "}
            ↗
          </a>
        ))}
      </section>
    </>
  );
}
