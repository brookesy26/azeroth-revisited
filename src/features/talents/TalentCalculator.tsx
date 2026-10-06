"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import "./calculator.css";
import type { TalentClass } from "@/types/content";
import {
  budgetForLevel,
  buildError,
  parseSharedBuild,
  totalPoints,
  type Ranks,
} from "./rules";

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

type Props = {
  cls: TalentClass;
  build: string;
  generated: string;
  levels: number[];
  maximum: number;
};

export default function TalentCalculator({
  cls,
  build,
  generated,
  levels,
  maximum,
}: Props) {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const shared = useMemo(
    () => parseSharedBuild(hash, cls, build, levels, maximum),
    [hash, cls, build, levels, maximum],
  );
  const [local, setLocal] = useState<{
    source: string;
    level: number;
    ranks: Ranks;
  } | null>(null);
  const current =
    local?.source === hash
      ? local
      : typeof shared === "object" && shared
        ? shared
        : { level: 60, ranks: {} };
  const { level, ranks } = current;
  const budget = budgetForLevel(level, levels, maximum);
  const spent = totalPoints(ranks);
  const talents = cls.trees.flatMap((tree) => tree.talents);
  const [selectedId, setSelectedId] = useState(talents[0]?.id);
  const selected =
    talents.find((talent) => talent.id === selectedId) ?? talents[0];
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  function changeRank(id: number, amount: number) {
    const next = { ...ranks, [id]: (ranks[id] ?? 0) + amount };
    const error = buildError(cls, next, budget);
    if (error) {
      setMessage(error);
      return;
    }
    setLocal({ source: hash, level, ranks: next });
    setSelectedId(id);
    setMessage("");
    setShareUrl("");
  }

  function changeLevel(value: string) {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 1 || next > 60) {
      setMessage("Choose a whole-number level between 1 and 60.");
      return;
    }
    const error = buildError(cls, ranks, budgetForLevel(next, levels, maximum));
    if (error) {
      setMessage(
        "Remove talent points or reset the build before lowering the level below your points spent.",
      );
      return;
    }
    setLocal({ source: hash, level: next, ranks });
    setMessage("");
    setShareUrl("");
  }

  async function share() {
    const url = new URL(window.location.href);
    url.hash = `talents=${encodeURIComponent(JSON.stringify({ build, class: cls.slug, level, ranks }))}`;
    setShareUrl(url.href);
    try {
      await navigator.clipboard.writeText(url.href);
      setMessage(
        "Build link copied. It includes your class, level and beta dataset version.",
      );
    } catch {
      setMessage(
        "Copy is unavailable in this browser. Select and copy the build link below.",
      );
    }
  }

  return (
    <section className="talent-calculator" aria-labelledby="calculator-title">
      <div className="section-heading">
        <p className="eyebrow">Plan your Forever build</p>
        <h2 id="calculator-title">{cls.name} talent calculator</h2>
      </div>
      <p>
        Beta build {build} · Dataset updated {generated}. Plan points across all
        three trees. This is a planning tool; beta tuning may change before
        launch.
      </p>
      <p className="muted">
        Uses the standard level-based point schedule. Any earlier-point Legacy
        perk is excluded. Prerequisites require at least one listed prerequisite
        at full rank.
      </p>
      {typeof shared === "string" && local?.source !== hash && (
        <p role="alert" className="calculator-message">
          {shared}
        </p>
      )}
      <div className="calculator-toolbar">
        <label htmlFor="talent-level">
          Character level{" "}
          <select
            id="talent-level"
            value={level}
            onChange={(event) => changeLevel(event.target.value)}
          >
            {Array.from({ length: 60 }, (_, index) => index + 1).map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ),
            )}
          </select>
        </label>
        <strong aria-live="polite">
          {spent} / {budget} points spent · {budget - spent} remaining
        </strong>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            setLocal({ source: hash, level, ranks: {} });
            setMessage("Build reset.");
            setShareUrl("");
          }}
        >
          Reset build
        </button>
        <button type="button" className="button" onClick={share}>
          Share build
        </button>
      </div>
      <p className="calculator-message" role="status">
        {message}
      </p>
      {shareUrl && (
        <label className="share-fallback">
          Build link{" "}
          <input
            readOnly
            value={shareUrl}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
      <div className="talent-trees">
        {cls.trees.map((tree) => (
          <section
            className="talent-tree"
            key={tree.id}
            aria-labelledby={`tree-${tree.id}`}
          >
            <h3 id={`tree-${tree.id}`}>
              {tree.name}{" "}
              <span>
                (
                {totalPoints(
                  Object.fromEntries(
                    tree.talents.map((talent) => [
                      talent.id,
                      ranks[talent.id] ?? 0,
                    ]),
                  ),
                )}
                )
              </span>
            </h3>
            <div
              className="talent-grid"
              style={{
                gridTemplateColumns: `repeat(${tree.columns}, minmax(0, 1fr))`,
              }}
            >
              {tree.talents.map((talent) => {
                const rank = ranks[talent.id] ?? 0;
                const addError = buildError(
                  cls,
                  { ...ranks, [talent.id]: rank + 1 },
                  budget,
                );
                const removeError =
                  rank > 0
                    ? buildError(
                        cls,
                        { ...ranks, [talent.id]: rank - 1 },
                        budget,
                      )
                    : "No points to remove.";
                const name = talent.name ?? `Talent ${talent.id}`;
                return (
                  <div
                    key={talent.id}
                    className={`talent-node${rank ? " active" : ""}${selected?.id === talent.id ? " selected" : ""}`}
                    style={{
                      gridRow: talent.row + 1,
                      gridColumn: talent.column + 1,
                    }}
                  >
                    <button
                      type="button"
                      className="talent-select"
                      title={name}
                      onClick={() => setSelectedId(talent.id)}
                      aria-pressed={selected?.id === talent.id}
                      aria-controls="talent-detail"
                    >
                      {talent.icon_id && (
                        <Image
                          src={`/images/talents/${talent.icon_id}.webp`}
                          width={40}
                          height={40}
                          alt=""
                        />
                      )}
                      <span>{name}</span>
                    </button>
                    <div className="talent-ranks">
                      <button
                        type="button"
                        onClick={() => changeRank(talent.id, -1)}
                        disabled={Boolean(removeError)}
                        aria-label={`Remove a point from ${name}`}
                      >
                        −
                      </button>
                      <span aria-label={`${rank} of ${talent.max_ranks} ranks`}>
                        {rank}/{talent.max_ranks}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeRank(talent.id, 1)}
                        disabled={Boolean(addError)}
                        aria-label={`Add a point to ${name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {selected && (
        <aside
          id="talent-detail"
          className="talent-detail"
          aria-labelledby="talent-detail-title"
        >
          <p className="eyebrow">Selected talent</p>
          <h3 id="talent-detail-title">
            {selected.name ?? `Talent ${selected.id}`}
          </h3>
          <p>
            Rank {ranks[selected.id] ?? 0} of {selected.max_ranks}. Requires{" "}
            {selected.points_required} points in earlier rows of this tree.
          </p>
          {selected.requires.length > 0 && (
            <p>
              Requires a full rank in{" "}
              {selected.requires
                .map(
                  (id) =>
                    talents.find((talent) => talent.id === id)?.name ??
                    `talent ${id}`,
                )
                .join(" or ")}
              .
            </p>
          )}
          {selected.description?.length ? (
            <ol>
              {selected.description.map((description, index) => (
                <li key={index}>
                  <strong>Rank {index + 1}:</strong> {description}
                </li>
              ))}
            </ol>
          ) : (
            <p>
              This dataset does not include a description. Check the maintained
              source before spending points in game.
            </p>
          )}
        </aside>
      )}
      <p className="muted">
        Talent dataset:{" "}
        <a
          href="https://wow-forever.gg/developers/"
          target="_blank"
          rel="noreferrer"
        >
          WoW Forever developer feed
        </a>
        , licensed CC BY 4.0. Game names and talent content belong to Blizzard.{" "}
        <a href={cls.page} target="_blank" rel="noreferrer">
          View the maintained {cls.name} trees
        </a>
        .
      </p>
    </section>
  );
}
