import type { Metadata } from "next";
import { getGuides, getSource, getTalents } from "@/lib/content/repository";
export const metadata: Metadata = {
  title: "Sources & credits",
  description:
    "Where our WoW Forever information, talent data and Warcraft artwork come from.",
};
export default function Sources() {
  const ids = Array.from(
    new Set(getGuides().flatMap((guide) => guide.sources)),
  );
  const data = getTalents();
  return (
    <article className="wow-content">
      <header className="guide-heading">
        <p className="wow-kicker">CHECK THE BUILD. KNOW THE SOURCE.</p>
        <h1>Sources & credits.</h1>
        <p className="wow-guide-intro">
          Official announcements underpin the editorial guides. Community data
          powers the beta talent planner. Neither is a substitute for checking
          the current client.
        </p>
      </header>
      <section className="article-section">
        <h2>Official and maintained sources</h2>
        <ul>
          {ids.map((id) => {
            const item = getSource(id);
            return (
              <li key={id}>
                <a href={item.url}>{item.title}</a>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="article-section">
        <h2>Talent data</h2>
        <p>{data.attribution}</p>
        <p>
          Build {data.build}; source refreshed {data.generated}. {data.licence}
        </p>
        <p>
          Our calculator uses a validated snapshot and versioned shared builds.
          A mismatched build is rejected instead of being silently remapped.
        </p>
      </section>
      <section className="article-section">
        <h2>Artwork</h2>
        <p>
          World of Warcraft artwork and icons belong to Blizzard Entertainment.
          Classic client loading screens and class icons are sourced from the
          Gethe texture archive, pinned to a source commit and optimised
          locally. They set the atmosphere; news-card artwork is not claimed to
          show the content of a particular article.
        </p>
        <a href="https://github.com/Gethe/wow-ui-textures">
          Gethe/wow-ui-textures source archive ↗
        </a>
      </section>
      <section className="article-section">
        <h2>News and editorial boundaries</h2>
        <p>
          News displays attributed headlines linking to the original post.
          Articles are not republished. Returning-player and Retail-transition
          pages provide advice for Forever only. We do not invent tested quest
          routes, best-in-slot rankings, launch classes or encounter tactics
          where verification is missing.
        </p>
      </section>
      <section className="article-section">
        <h2>Privacy</h2>
        <p>
          No analytics, ads, accounts or submission forms are included. Guide
          filters and talent builds are stored in their shareable URL. Hosting
          providers receive ordinary requests needed to serve the website.
          Cloudflare may record operational request data; no visitor tracking
          script is added by this project.
        </p>
      </section>
    </article>
  );
}
