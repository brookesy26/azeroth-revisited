import Link from "next/link";
import type { Guide } from "@/types/content";
import { getSource } from "@/lib/content/repository";
export function GuidePage({ guide }: { guide: Guide }) {
  return (
    <article className="wow-guide wow-content">
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link> / {guide.title}
      </nav>
      <header className="guide-heading">
        <p className="wow-kicker">{guide.eyebrow}</p>
        <h1>{guide.title}</h1>
        <p className="wow-guide-intro">{guide.description}</p>
        <p className="wow-guide-meta">
          BETA · SUBJECT TO CHANGE{" "}
          <span>Reviewed {guide.updated} · WoW Forever only</span>
        </p>
      </header>
      <nav className="contents" aria-label="On this page">
        <strong>On this page</strong>
        {guide.sections.map((section, index) => (
          <a key={section.title} href={`#section-${index}`}>
            {section.title}
          </a>
        ))}
      </nav>
      {guide.comparison && (
        <section>
          <h2>What is different?</h2>
          <div className="comparison-wrap">
            <table className="wow-comparison">
              <thead>
                <tr>
                  <th>System</th>
                  <th>What you may remember</th>
                  <th>Forever beta</th>
                </tr>
              </thead>
              <tbody>
                {guide.comparison.map(([system, before, after]) => (
                  <tr key={system}>
                    <th scope="row">{system}</th>
                    <td>{before}</td>
                    <td>{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {guide.sections.map((section, index) => (
        <section
          className="article-section"
          id={`section-${index}`}
          key={section.title}
        >
          <h2>{section.title}</h2>
          <p>{section.body}</p>
          {section.bullets && (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <section className="wow-sources">
        <h2>Sources behind this guide</h2>
        {guide.sources.map((id) => {
          const source = getSource(id);
          return (
            <a key={id} href={source.url}>
              {source.title} ↗
            </a>
          );
        })}
        <p>
          Beta systems may change. Recommendations are preparation advice, not a
          claim that we have completed or tested every encounter.
        </p>
      </section>
      <div className="wow-actions">
        <Link className="wow-cta" href="/classes/">
          Explore classes & talents →
        </Link>
        <Link className="wow-cta secondary" href="/news/">
          Check the latest news →
        </Link>
      </div>
    </article>
  );
}
