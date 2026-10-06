import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Accessibility statement",
  description:
    "Accessibility approach, tested scope and outstanding verification for Azeroth Revisited.",
};
export default function Accessibility() {
  return (
    <article className="wow-content">
      <header className="guide-heading">
        <p className="wow-kicker">ACCESSIBILITY STATEMENT</p>
        <h1>A world you can navigate.</h1>
        <p className="wow-guide-intro">
          We aim to support keyboard use, clear reading, zoom and assistive
          technology across this fan guide.
        </p>
      </header>
      <section className="article-section">
        <h2>Current status</h2>
        <p>
          This project targets WCAG 2.2, including applicable AAA criteria, but
          is not labelled AAA compliant. Automated checks cannot establish full
          conformance. The repository contains a criterion-by-criterion evidence
          register recording verified checks and work still pending.
        </p>
      </section>
      <section className="article-section">
        <h2>Included features</h2>
        <ul>
          <li>
            A skip link and semantic navigation, main content and headings.
          </li>
          <li>
            A mobile navigation dialog that supports Escape and returns focus to
            its menu button.
          </li>
          <li>
            Keyboard-operable talent controls and visible descriptions without
            relying on hover.
          </li>
          <li>
            Responsive layouts, reduced-motion handling and text-based labels
            alongside icons.
          </li>
          <li>
            Attribution, beta notices and direct source links to clarify
            changing information.
          </li>
        </ul>
      </section>
      <section className="article-section">
        <h2>Verification limits</h2>
        <p>
          Manual screen-reader verification, all AAA reading-level and
          pronunciation requirements, and the complete set of user journeys
          require further review. News and linked third-party websites are
          outside our control. Automated browser and contrast results are
          documented with their tested scope in the repository; they do not
          establish conformance for external articles.
        </p>
      </section>
      <section className="article-section">
        <h2>Using the site without JavaScript</h2>
        <p>
          Editorial guides, class introductions, sources and navigation links
          remain available. Live countdown updates, filtered search and
          interactive talent allocation need JavaScript. The launch date and
          source links remain readable.
        </p>
      </section>
      <section className="article-section">
        <h2>Reporting a barrier</h2>
        <p>
          If you have access to the repository, open an issue describing the
          page, the action, your browser and assistive technology. Avoid
          including account details or private information.
        </p>
        <a href="https://github.com/brookesy26/azeroth-revisited/issues">
          Report an accessibility issue ↗
        </a>
      </section>
    </article>
  );
}
