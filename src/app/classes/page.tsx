import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getClasses, getTalents } from "@/lib/content/repository";
export const metadata: Metadata = {
  title: "Forever classes & talents",
  description:
    "All nine announced WoW Forever classes, current beta talent trees and preparation guidance.",
};
export default function Classes() {
  const data = getTalents();
  return (
    <div className="wow-content">
      <header className="guide-heading">
        <p className="wow-kicker">OLD FAVOURITES. NEW DECISIONS.</p>
        <h1>Know your class again.</h1>
        <p className="wow-guide-intro">
          The nine announced classes, with the current maintained beta talent
          data. New race/class combinations do not mean new classes.
        </p>
        <p className="wow-guide-meta">
          Community dataset · Build {data.build} · Refreshed {data.generated}
        </p>
      </header>
      <div className="card-grid">
        {getClasses().map((item) => (
          <Link
            className="guide-card class-card"
            href={`/classes/${item.slug}/`}
            key={item.id}
          >
            <Image
              src={`/images/${item.slug}.webp`}
              width={56}
              height={56}
              alt=""
            />
            <div>
              <h2>{item.name}</h2>
              <p>{item.trees.map((tree) => tree.name).join(" · ")}</p>
              <span>Guide & talent calculator →</span>
            </div>
          </Link>
        ))}
      </div>
      <section className="wow-sources">
        <h2>A current tree is not a proven best build</h2>
        <p>
          The calculator lets you explore the recorded talents. We do not claim
          beta rankings, rotations or damage estimates have been verified in
          game.
        </p>
        <a href="https://worldofwarcraft.blizzard.com/en-us/news/24304075/">
          Blizzard’s class and race roster ↗
        </a>
      </section>
    </div>
  );
}
