import type { Metadata } from "next";
import { getGuides, getClasses } from "@/lib/content/repository";
import { GuideSearch } from "@/features/search/guide-search";
export const metadata: Metadata = {
  title: "Search Forever guides",
  description: "Find WoW Forever guides, classes and transition advice.",
};
export default function Search() {
  const items = [
    ...getGuides().map((item) => ({
      href: `/${item.slug}/`,
      title: item.title,
      description: item.description,
    })),
    ...getClasses().map((item) => ({
      href: `/classes/${item.slug}/`,
      title: item.name + " guide & talents",
      description: item.trees.map((tree) => tree.name).join(", "),
    })),
  ];
  return (
    <div className="wow-content">
      <header className="guide-heading">
        <p className="wow-kicker">FIND YOUR NEXT ADVENTURE</p>
        <h1>Search the field guide.</h1>
      </header>
      <GuideSearch items={items} />
      <noscript>
        <p>
          Search filtering needs JavaScript. All guide links are listed above
          and the navigation remains available.
        </p>
      </noscript>
    </div>
  );
}
