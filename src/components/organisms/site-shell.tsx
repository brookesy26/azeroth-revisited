"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  toggleSidebar,
  useAppDispatch,
  useAppSelector,
} from "@/store/provider";

const routes = [
  ["/", "Home"],
  ["/news/", "News & beta updates"],
  ["/returning-players/", "Returning to WoW"],
  ["/vanilla-vs-forever/", "Vanilla vs Forever"],
  ["/coming-from-retail/", "Coming from Retail"],
  ["/classes/", "Classes & talents"],
  ["/questing/", "Questing & levelling"],
  ["/races-and-areas/", "Races & new areas"],
  ["/dungeons-and-raids/", "Dungeons & raids"],
  ["/professions/", "Professions & camping"],
  ["/legacy/", "Legacy progression"],
  ["/launch/", "Launch preparation"],
];
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.preferences.sidebarCollapsed);
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const navigation = (
    <nav aria-label="Main navigation">
      {routes.map(([url, label]) => (
        <Link
          key={url}
          href={url}
          aria-current={
            pathname === url ||
            pathname === url.slice(0, -1) ||
            (url === "/classes/" && pathname.startsWith("/classes/"))
              ? "page"
              : undefined
          }
          onClick={() => dialog.current?.close()}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
  function toggleMenu() {
    if (window.matchMedia("(max-width: 740px)").matches)
      dialog.current?.showModal();
    else dispatch(toggleSidebar());
  }
  return (
    <div className={`wow-shell ${collapsed ? "desktop-collapsed" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className="wow-sidebar">
        <Link href="/" className="wow-brand">
          <span>AZEROTH</span>
          <strong>REVISITED</strong>
          <small>WORLD OF WARCRAFT · FOREVER</small>
        </Link>
        <p className="wow-nav-label">YOUR NEXT ADVENTURE</p>
        {navigation}
        <div className="wow-side-note">
          <Link href="/faq/">Beta & launch FAQ</Link>
          <p>
            A changing world.
            <br />
            Check the build. Know the source.
          </p>
        </div>
      </aside>
      <dialog
        ref={dialog}
        aria-label="Site navigation"
        className="navigation-drawer"
        onClose={() => menu.current?.focus()}
      >
        <button
          className="wow-cta secondary"
          onClick={() => dialog.current?.close()}
        >
          Close menu
        </button>
        <p className="wow-nav-label">AZEROTH REVISITED</p>
        {navigation}
      </dialog>
      <div className="wow-main">
        <header className="wow-top">
          <button
            ref={menu}
            className="wow-menu"
            aria-label="Toggle navigation menu"
            onClick={toggleMenu}
          >
            ☰ Menu
          </button>
          <Link className="wow-mobile-brand" href="/">
            AZEROTH REVISITED
          </Link>
          <span className="wow-top-note">
            THE WORLD YOU REMEMBER. THE CHANGES YOU NEED.
          </span>
          <Link className="wow-beta-label" href="/faq/">
            FOREVER BETA
          </Link>
          <Link href="/search/" className="search-link">
            Search guides
          </Link>
        </header>
        <noscript>
          <details className="no-js-navigation">
            <summary>Browse all guides</summary>
            {navigation}
          </details>
        </noscript>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="wow-footer site-footer">
          <span>
            Independent fan guide · Warcraft art © Blizzard Entertainment
          </span>
          <div>
            <Link href="/accessibility/">Accessibility</Link> ·{" "}
            <Link href="/sources/">Sources & credits</Link> ·{" "}
            <Link href="/design-system/">Design system</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
