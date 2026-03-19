"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

import CountdownTimer from "@/components/CountdownTimer";
import { PREDICTION_DEADLINE } from "@/lib/config";
import { buildGroupMatches, getGroupBySlug } from "@/lib/group-stage-data";

interface Scoreline {
  home: number;
  away: number;
}

interface GroupPrediction {
  type: string;
  groupName: string | null;
  teamOrder: string[];
}

const emojiToCodepoint = (emoji: string) =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

const getEmojiUrl = (emoji: string) =>
  `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

function getDefaultScores(matchIds: string[]): Record<string, Scoreline> {
  return matchIds.reduce<Record<string, Scoreline>>((accumulator, id) => {
    accumulator[id] = { home: 0, away: 0 };
    return accumulator;
  }, {});
}

export default function GroupMatchesPage() {
  const router = useRouter();
  const params = useParams<{ groupSlug: string }>();
  const groupSlug = params.groupSlug;
  const group = getGroupBySlug(groupSlug);

  const matches = useMemo(() => (group ? buildGroupMatches(group) : []), [group]);

  const [scores, setScores] = useState<Record<string, Scoreline>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [predictionsLocked, setPredictionsLocked] = useState(false);

  useEffect(() => {
    async function loadPrediction() {
      if (!group) {
        setIsLoading(false);
        return;
      }

      const defaults = getDefaultScores(matches.map((match) => match.id));

      try {
        const response = await fetch("/api/predictions");
        const data = await response.json();

        const prediction = (data.predictions || []).find(
          (item: GroupPrediction) => item.type === "GROUP" && item.groupName === group.id,
        ) as GroupPrediction | undefined;

        if (!prediction || !Array.isArray(prediction.teamOrder)) {
          setScores(defaults);
          return;
        }

        const loadedScores = { ...defaults };

        prediction.teamOrder.forEach((entry) => {
          if (!entry.startsWith("MATCH|")) {
            return;
          }

          const parts = entry.split("|");
          if (parts.length !== 4) {
            return;
          }

          const [home, away] = parts[3].split("-").map((value) => Number(value));
          const matchId = `${group.id}-${parts[1]}-${parts[2]}`;

          if (Number.isNaN(home) || Number.isNaN(away) || !loadedScores[matchId]) {
            return;
          }

          loadedScores[matchId] = {
            home: Math.max(0, home),
            away: Math.max(0, away),
          };
        });

        setScores(loadedScores);
      } catch (error) {
        console.error("Error loading group prediction:", error);
        setScores(defaults);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrediction();
  }, [group, matches]);

  if (!group) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 border-2 border-gray-200 text-center max-w-md">
          <h1 className="font-display text-3xl text-gray-900 mb-4">Group not found</h1>
          <button onClick={() => router.push("/groups")} className="wc-btn-primary px-8 py-3">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  const updateScore = (matchId: string, side: "home" | "away", delta: number) => {
    setScores((previous) => {
      const current = previous[matchId] ?? { home: 0, away: 0 };
      const nextValue = Math.max(0, current[side] + delta);

      return {
        ...previous,
        [matchId]: {
          ...current,
          [side]: nextValue,
        },
      };
    });
  };

  const ranking = (() => {
    const table = group.teams.reduce<Record<string, { points: number; gd: number; gf: number; seed: number }>>(
      (accumulator, team, index) => {
        accumulator[team.id] = { points: 0, gd: 0, gf: 0, seed: index };
        return accumulator;
      },
      {},
    );

    matches.forEach((match) => {
      const score = scores[match.id] ?? { home: 0, away: 0 };
      const home = table[match.homeTeam.id];
      const away = table[match.awayTeam.id];

      home.gf += score.home;
      away.gf += score.away;
      home.gd += score.home - score.away;
      away.gd += score.away - score.home;

      if (score.home > score.away) {
        home.points += 3;
      } else if (score.home < score.away) {
        away.points += 3;
      } else {
        home.points += 1;
        away.points += 1;
      }
    });

    return [...group.teams]
      .sort((left, right) => {
        const leftStats = table[left.id];
        const rightStats = table[right.id];

        if (rightStats.points !== leftStats.points) {
          return rightStats.points - leftStats.points;
        }

        if (rightStats.gd !== leftStats.gd) {
          return rightStats.gd - leftStats.gd;
        }

        if (rightStats.gf !== leftStats.gf) {
          return rightStats.gf - leftStats.gf;
        }

        return leftStats.seed - rightStats.seed;
      })
      .map((team) => team.id);
  })();

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const encodedMatches = matches.map((match) => {
        const score = scores[match.id] ?? { home: 0, away: 0 };
        return `MATCH|${match.homeTeam.id}|${match.awayTeam.id}|${score.home}-${score.away}`;
      });

      const payload = [
        {
          type: "GROUP",
          groupName: group.id,
          teamOrder: [...ranking, ...encodedMatches],
        },
      ];

      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: payload }),
      });

      if (!response.ok) {
        throw new Error("Failed to save predictions");
      }

      router.push("/groups");
    } catch (error) {
      console.error("Error saving group predictions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500" />
          <p className="text-gray-500">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-50 via-white to-blue-50" />
      </div>

      <div className="wc-container relative z-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.push("/groups")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <CountdownTimer targetDate={PREDICTION_DEADLINE} variant="compact" />
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <span className="font-display text-3xl text-white">{group.id}</span>
            </div>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-gray-900 mb-3">{group.name}</h1>
          <p className="text-gray-500 text-lg">Set exact scores for all matches</p>
        </motion.div>

        <div className="space-y-5 mb-8">
          {matches.map((match, matchIndex) => {
            const score = scores[match.id] ?? { home: 0, away: 0 };

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: matchIndex * 0.08 }}
                className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={getEmojiUrl(match.homeTeam.flag)}
                      alt={match.homeTeam.name}
                      className="w-14 h-10 rounded-lg object-cover shadow-md"
                    />
                    <span className="text-gray-900 text-xl font-semibold">{match.homeTeam.name}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => updateScore(match.id, "home", -1)}
                      disabled={predictionsLocked}
                      className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-2xl font-bold text-gray-700 transition-all"
                      aria-label={`Decrease ${match.homeTeam.name} score`}
                    >
                      −
                    </button>
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="font-display text-4xl text-gray-900">{score.home}</span>
                    </div>
                    <button
                      onClick={() => updateScore(match.id, "home", 1)}
                      disabled={predictionsLocked}
                      className="w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-2xl font-bold text-white transition-all"
                      aria-label={`Increase ${match.homeTeam.name} score`}
                    >
                      +
                    </button>

                    <div className="w-8 text-center font-display text-2xl text-gray-400">:</div>

                    <button
                      onClick={() => updateScore(match.id, "away", -1)}
                      disabled={predictionsLocked}
                      className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-2xl font-bold text-gray-700 transition-all"
                      aria-label={`Decrease ${match.awayTeam.name} score`}
                    >
                      −
                    </button>
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="font-display text-4xl text-gray-900">{score.away}</span>
                    </div>
                    <button
                      onClick={() => updateScore(match.id, "away", 1)}
                      disabled={predictionsLocked}
                      className="w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-2xl font-bold text-white transition-all"
                      aria-label={`Increase ${match.awayTeam.name} score`}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4 flex-1 sm:flex-row-reverse">
                    <img
                      src={getEmojiUrl(match.awayTeam.flag)}
                      alt={match.awayTeam.name}
                      className="w-14 h-10 rounded-lg object-cover shadow-md"
                    />
                    <span className="text-gray-900 text-xl font-semibold text-right">{match.awayTeam.name}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end">
          {predictionsLocked ? (
            <div className="wc-btn-disabled px-12">Locked</div>
          ) : (
            <motion.button
              whileHover={!isSaving ? { scale: 1.03 } : {}}
              whileTap={!isSaving ? { scale: 0.97 } : {}}
              onClick={handleSave}
              disabled={isSaving}
              className={`wc-btn-primary px-12 ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSaving ? "Saving..." : "Save"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
