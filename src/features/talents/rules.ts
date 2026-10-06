import type { TalentClass } from "@/types/content";

export type Ranks = Record<string, number>;

export function totalPoints(ranks: Ranks): number {
  return Object.values(ranks).reduce((sum, rank) => sum + rank, 0);
}

export function budgetForLevel(
  level: number,
  levels: number[],
  maximum: number,
): number {
  return Math.min(maximum, levels.filter((grant) => grant <= level).length);
}

export function buildError(
  cls: TalentClass,
  ranks: Ranks,
  budget: number,
): string | null {
  const talents = cls.trees.flatMap((tree) => tree.talents);
  const byId = new Map(talents.map((talent) => [String(talent.id), talent]));
  for (const [id, rank] of Object.entries(ranks)) {
    const talent = byId.get(id);
    if (!talent)
      return "This build includes a talent that is absent from the current dataset.";
    if (!Number.isInteger(rank) || rank < 0 || rank > talent.max_ranks)
      return "Every talent rank must be a whole number within its rank limit.";
  }
  if (!Number.isFinite(budget) || budget < 0 || totalPoints(ranks) > budget)
    return "This build spends more points than your selected level allows.";
  for (const tree of cls.trees) {
    for (const talent of tree.talents) {
      if (!(ranks[talent.id] > 0)) continue;
      const earlierPoints = tree.talents
        .filter((candidate) => candidate.row < talent.row)
        .reduce((sum, candidate) => sum + (ranks[candidate.id] ?? 0), 0);
      if (earlierPoints < talent.points_required)
        return `${talent.name ?? "This talent"} requires ${talent.points_required} points in earlier rows of ${tree.name}.`;
      if (
        talent.requires.length &&
        !talent.requires.some((id) => {
          const prerequisite = byId.get(String(id));
          return prerequisite && ranks[id] === prerequisite.max_ranks;
        })
      )
        return `${talent.name ?? "This talent"} requires a fully ranked prerequisite talent.`;
    }
  }
  return null;
}

export function validateBuild(
  cls: TalentClass,
  ranks: Ranks,
  budget: number,
): boolean {
  return buildError(cls, ranks, budget) === null;
}

export type SharedBuild = { level: number; ranks: Ranks };

export function parseSharedBuild(
  hash: string,
  cls: TalentClass,
  build: string,
  levels: number[],
  maximum: number,
): SharedBuild | string | null {
  if (!hash || hash === "#") return null;
  if (!hash.startsWith("#talents="))
    return "This URL does not contain a recognised talent build.";
  try {
    const data: unknown = JSON.parse(decodeURIComponent(hash.slice(9)));
    if (!data || typeof data !== "object" || Array.isArray(data))
      return "The shared build is malformed.";
    const candidate = data as Record<string, unknown>;
    if (candidate.build !== build)
      return "This shared build uses a different beta dataset. It cannot be safely loaded. Recreate it against the current build.";
    if (candidate.class !== cls.slug)
      return "This shared build belongs to another class. Open its class page to load it.";
    if (
      typeof candidate.level !== "number" ||
      !Number.isInteger(candidate.level) ||
      candidate.level < 1 ||
      candidate.level > 60
    )
      return "The shared level must be between 1 and 60.";
    if (
      !candidate.ranks ||
      typeof candidate.ranks !== "object" ||
      Array.isArray(candidate.ranks)
    )
      return "The shared talent ranks are malformed.";
    const ranks = candidate.ranks as Ranks;
    const error = buildError(
      cls,
      ranks,
      budgetForLevel(candidate.level, levels, maximum),
    );
    return error ?? { level: candidate.level, ranks };
  } catch {
    return "The shared build could not be read. Check that the complete link was copied.";
  }
}
