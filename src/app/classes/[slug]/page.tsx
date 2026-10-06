import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getClass,
  getClasses,
  getTalents,
  getSource,
} from "@/lib/content/repository";
import { TalentCalculator } from "@/features/talents/talent-calculator";
export const dynamicParams = false;
export function generateStaticParams() {
  return getClasses().map((item) => ({ slug: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = getClass((await params).slug);
  return {
    title: `${item?.name} guide & talents`,
    description: `Explore ${item?.name} talent trees in WoW Forever, with current beta data and returning-player guidance.`,
  };
}
const roles: Record<string, string> = {
  warrior:
    "Arms and Fury focus on melee damage; Protection supports tanking. Relearn Rage, stance choices and threat.",
  paladin:
    "Holy, Protection and Retribution give healing, tanking and melee directions. Recheck baseline blessings and your available abilities.",
  hunter:
    "Beast Mastery, Marksmanship and Survival offer pet, ranged, trap and melee choices. Blizzard’s preview also describes options without a pet.",
  rogue:
    "Assassination, Combat and Subtlety offer different melee and stealth directions. Check costs, combo-point effects and utility before copying a build.",
  priest:
    "Discipline, Holy and Shadow support protection, healing and spell damage. Blizzard broadens access to important priest tools.",
  shaman:
    "Elemental, Enhancement and Restoration support spell damage, melee and healing directions. Read the current totems and role-specific talents.",
  mage: "Arcane, Fire and Frost keep the familiar magic identities. Compare current spell interactions, control and resource demands.",
  warlock:
    "Affliction, Demonology and Destruction organise damage-over-time, demon and direct-spell choices. Read current pet and spell interactions.",
  druid:
    "Balance, Feral Combat and Restoration support different forms and nature-magic roles. Recheck form-specific tools and mana planning.",
};
export default async function ClassPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getClass((await params).slug);
  if (!item) notFound();
  const data = getTalents();
  const official = ["hunter", "druid"].includes(item.slug)
    ? getSource("hunter-druid")
    : ["priest", "warrior"].includes(item.slug)
      ? getSource("priest-warrior")
      : getSource("roster");
  return (
    <article className="wow-content">
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/classes/">Classes</Link> /{" "}
        {item.name}
      </nav>
      <header className="wow-guide-header">
        <Image
          className="wow-guide-icon"
          src={`/images/${item.slug}.webp`}
          width={76}
          height={76}
          alt=""
        />
        <div>
          <p className="wow-kicker">FOREVER CLASS FIELD GUIDE</p>
          <h1>The {item.name}, revisited.</h1>
        </div>
      </header>
      <p className="wow-guide-intro">{roles[item.slug]}</p>
      <p className="wow-guide-meta">
        BETA · Build {data.build} · Dataset refreshed {data.generated}
      </p>
      <section className="article-section">
        <h2>Returning-player checklist</h2>
        <ul>
          <li>
            Read your current abilities and visit a trainer before planning
            around an old rotation.
          </li>
          <li>
            Choose a tree for the activity and role you enjoy. A levelling plan
            need not be a raid plan.
          </li>
          <li>
            Inspect prerequisite talents and point gates; unfamiliar
            combinations may be invalid.
          </li>
          <li>
            Review equipment stats in the current client rather than copying a
            Vanilla best-in-slot list.
          </li>
        </ul>
        <div className="wow-actions">
          <Link href="/vanilla-vs-forever/" className="wow-cta secondary">
            Compare with Vanilla →
          </Link>
          <Link href="/coming-from-retail/" className="wow-cta secondary">
            Coming from Retail →
          </Link>
        </div>
      </section>
      <TalentCalculator
        cls={item}
        build={data.build}
        generated={data.generated}
        levels={data.levels_that_grant_a_point}
        maximum={data.points_at_level_60}
      />
      <noscript>
        <p>
          Interactive planning needs JavaScript. The class guide and all source
          links remain available.{" "}
          <a href={item.page}>Open the maintained source calculator</a>.
        </p>
      </noscript>
      <section className="wow-sources">
        <h2>Sources and limits</h2>
        <a href={official.url}>{official.title} ↗</a>
        <a href={item.page}>Maintained {item.name} talent source ↗</a>
        <p>{data.attribution}</p>
        <p>
          Compilation licensed CC BY 4.0; game content belongs to Blizzard.
          These trees come from beta data and do not prove talent effects have
          been tested in game. Legacy’s earlier-point perk is not modelled in
          this standard class calculator.
        </p>
      </section>
    </article>
  );
}
