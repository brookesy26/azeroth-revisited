import type { Metadata } from "next";
import { ButtonLink } from "@/components/atoms/button-link";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Design system",
  description:
    "The ember and stone design language, components and states used by Azeroth Revisited.",
};
export default function DesignSystem() {
  return (
    <div className="wow-content">
      <header className="guide-heading">
        <p className="wow-kicker">EMBER & STONE</p>
        <h1>Azeroth’s field guide.</h1>
        <p className="wow-guide-intro">
          Warm orange highlights, framed Warcraft imagery and generous reading
          space. A small showcase of the actual site components.
        </p>
      </header>
      <section className="article-section">
        <h2>Actions</h2>
        <div className="wow-actions">
          <ButtonLink href="/returning-players/">Returning to WoW →</ButtonLink>
          <ButtonLink href="/coming-from-retail/" secondary>
            Coming from Retail →
          </ButtonLink>
          <button className="wow-cta" disabled>
            Unavailable action
          </button>
        </div>
      </section>
      <section className="article-section">
        <h2>Content hierarchy</h2>
        <span className="wow-label">BETA · SOURCE VERIFIED</span>
        <h3>A recognisable heading</h3>
        <p>
          Plain-language text explains what changed and why it matters. Sources
          and beta dates follow the guide rather than interrupting each
          sentence.
        </p>
        <Link href="/sources/">A descriptive source link</Link>
      </section>
      <section className="wow-guide-focus">
        <h2>Important guide information</h2>
        <p>
          A warm accent and a written label communicate the message together.
          Colour alone never identifies a status.
        </p>
      </section>
      <section className="article-section">
        <h2>Empty, loading and error states</h2>
        <p role="status">Loading a guide…</p>
        <p>No matching guide was found. Try a shorter search.</p>
        <p className="feedback-error">
          This source could not update. The previous snapshot and its timestamp
          remain visible.
        </p>
      </section>
    </div>
  );
}
