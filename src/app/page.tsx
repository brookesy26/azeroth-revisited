import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/atoms/button-link";
import { LaunchCountdown } from "@/features/countdown/launch-countdown";
import { getNews, getClasses, getFeaturedNews } from "@/lib/content/repository";
export default function Home() {
  const news = getNews();
  const featuredNews = getFeaturedNews();
  return (
    <>
      <section className="wow-hero">
        <div className="wow-hero-copy">
          <p className="wow-kicker">VANILLA ROOTS. A NEW CHAPTER.</p>
          <h1>
            Back to Azeroth.
            <br />
            <em>Into the unknown.</em>
          </h1>
          <p>
            The roads are familiar. The adventure has changed. Catch up on WoW
            Forever, from reworked classes to new corners of the world.
          </p>
          <div className="wow-actions">
            <ButtonLink href="/returning-players/">
              Returning to WoW →
            </ButtonLink>
            <ButtonLink href="/coming-from-retail/" secondary>
              Coming from Retail →
            </ButtonLink>
          </div>
        </div>
        <span className="wow-art-credit">
          CLASSIC WARCRAFT ART · BLACKROCK DEPTHS
        </span>
      </section>
      <LaunchCountdown />
      <div className="wow-content">
        <section>
          <div className="wow-heading">
            <h2>News from Azeroth</h2>
            <Link href="/news/">All news & beta updates →</Link>
          </div>
          <p className="feed-status">
            Official posts via an attributed community feed · Checked{" "}
            <time dateTime={news.updatedAt}>
              {new Date(news.updatedAt).toLocaleString("en-GB", {
                timeZone: "Europe/London",
              })}{" "}
              UK
            </time>
          </p>
          <div className="wow-news-grid">
            {featuredNews.map((item, index) => (
              <article className="wow-news-card" key={item.url}>
                <div
                  className={`wow-news-art ${index ? "kingdom" : "molten"}`}
                  aria-hidden="true"
                />
                <div className="wow-news-copy">
                  <span className="wow-label">OFFICIAL · {item.category}</span>
                  <h3>
                    <a href={item.url}>{item.title}</a>
                  </h3>
                  <p>Read the original Blizzard post for the latest details.</p>
                  <a className="wow-inline-link" href={item.url}>
                    Read official update ↗
                  </a>
                  <small>
                    {new Date(item.date).toLocaleDateString("en-GB")} · Blizzard
                  </small>
                </div>
              </article>
            ))}
          </div>
          <p className="art-caption">
            Classic artwork provides atmosphere; it does not depict each news
            post.
          </p>
        </section>
        <section className="wow-class-section">
          <div className="wow-heading">
            <h2>Know your class again</h2>
            <Link href="/classes/">Classes & talents →</Link>
          </div>
          <div className="wow-class-grid">
            {getClasses().map((item) => (
              <Link
                className="wow-class"
                href={`/classes/${item.slug}/`}
                key={item.id}
              >
                <Image
                  src={`/images/${item.slug}.webp`}
                  alt=""
                  width={39}
                  height={39}
                />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="wow-retail-callout">
          <div>
            <p className="wow-kicker">MAKING THE MOVE FROM RETAIL?</p>
            <h2>A familiar game. A different rhythm.</h2>
            <p>
              Learn how the level-60 journey, talent trees, trainers and
              tactical combat change the way you play. All our gameplay guides
              cover Forever.
            </p>
          </div>
          <ButtonLink href="/coming-from-retail/" secondary>
            Coming from Retail →
          </ButtonLink>
        </section>
        <section className="guide-links">
          <h2>Choose your next adventure</h2>
          <div className="card-grid">
            {[
              [
                "questing",
                "Questing & levelling",
                "Prepare your route through a changed world.",
              ],
              [
                "races-and-areas",
                "New races & areas",
                "Meet the Skyborne and discover new destinations.",
              ],
              [
                "dungeons-and-raids",
                "Dungeons & raids",
                "Know the announced adventures and prepare your party.",
              ],
              [
                "professions",
                "Professions & camping",
                "Make useful things and find a place by the fire.",
              ],
            ].map(([slug, title, description]) => (
              <Link className="guide-card" href={`/${slug}/`} key={slug}>
                <h3>{title}</h3>
                <p>{description}</p>
                <span>Explore guide →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
