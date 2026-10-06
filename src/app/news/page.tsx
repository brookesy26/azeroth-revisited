import type { Metadata } from "next";
import { getNews } from "@/lib/content/repository";
export const metadata: Metadata = {
  title: "News & beta updates",
  description:
    "Latest Blizzard posts about WoW Forever, with original source links and a visible refresh time.",
};
export default function News() {
  const news = getNews();
  return (
    <div className="wow-content">
      <header className="guide-heading">
        <p className="wow-kicker">FROM THE FRONT LINES</p>
        <h1>News from Azeroth.</h1>
        <p className="wow-guide-intro">
          Official updates about Forever, collected in one place. Open the
          original post for its full detail.
        </p>
        <p className="feed-status">
          Feed snapshot checked{" "}
          <time dateTime={news.updatedAt}>
            {new Date(news.updatedAt).toLocaleString("en-GB", {
              timeZone: "Europe/London",
            })}{" "}
            UK
          </time>
          . Refresh failures retain this timestamp.
        </p>
      </header>
      <div className="news-feed">
        {news.items.length ? (
          news.items.map((item) => (
            <article key={item.url} className="news-row">
              <span className="wow-label">
                {item.source} · {item.category}
              </span>
              <h2>
                <a href={item.url}>{item.title}</a>
              </h2>
              <time dateTime={item.date}>
                {new Date(item.date).toLocaleDateString("en-GB")}
              </time>
              <a href={item.url} className="wow-inline-link">
                Read original post ↗
              </a>
            </article>
          ))
        ) : (
          <p>
            No news is available. Visit{" "}
            <a href="https://worldofwarcraft.blizzard.com/en-gb/news">
              Blizzard’s news site
            </a>
            .
          </p>
        )}
      </div>
      <section className="wow-sources">
        <h2>How this feed works</h2>
        <p>
          Titles, dates and original links come from the Forever-focused
          official-post feed maintained by WoW Forever. Full articles are not
          copied here. This community feed can omit posts or lag behind
          Blizzard.
        </p>
        <a href={news.feed}>View the source feed ↗</a>
        <a href="https://worldofwarcraft.blizzard.com/en-gb/news">
          Check Blizzard directly ↗
        </a>
      </section>
    </div>
  );
}
