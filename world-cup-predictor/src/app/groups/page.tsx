"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import CountdownTimer from "@/components/CountdownTimer";
import { PREDICTION_DEADLINE } from "@/lib/config";
import { GROUP_STAGE_GROUPS, type GroupStageGroup, type GroupStageTeam } from "@/lib/group-stage-data";

interface StoredPrediction {
  type: string;
  groupName: string | null;
  teamOrder: string[];
}

interface TeamStats {
  team: GroupStageTeam;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

interface GroupStandings {
  [groupId: string]: TeamStats[];
}

const emojiToCodepoint = (emoji: string) =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

const getEmojiUrl = (emoji: string) =>
  `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

function countValidMatchPredictions(group: GroupStageGroup, predictions: StoredPrediction[]): number {
  const groupPrediction = predictions.find(
    (p) => p.type === "GROUP" && p.groupName === group.id
  );

  if (!groupPrediction || !groupPrediction.teamOrder) {
    return 0;
  }

  let count = 0;
  groupPrediction.teamOrder.forEach((entry) => {
    if (!entry.startsWith("MATCH|")) return;

    const parts = entry.split("|");
    if (parts.length !== 4) return;

    const scoreStr = parts[3];
    const [homeScore, awayScore] = scoreStr.split("-").map(Number);

    if (!isNaN(homeScore) && !isNaN(awayScore) && homeScore >= 0 && awayScore >= 0) {
      count++;
    }
  });

  return count;
}

function calculateStandings(group: GroupStageGroup, predictions: StoredPrediction[]): TeamStats[] {
  const groupPrediction = predictions.find(
    (p) => p.type === "GROUP" && p.groupName === group.id
  );

  const stats: Record<string, TeamStats> = {};
  group.teams.forEach((team) => {
    stats[team.id] = {
      team,
      mp: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    };
  });

  if (!groupPrediction || !groupPrediction.teamOrder) {
    return group.teams.map((team) => stats[team.id]);
  }

  groupPrediction.teamOrder.forEach((entry) => {
    if (!entry.startsWith("MATCH|")) return;

    const parts = entry.split("|");
    if (parts.length !== 4) return;

    const [, homeId, awayId, scoreStr] = parts;
    const [homeScore, awayScore] = scoreStr.split("-").map(Number);

    if (isNaN(homeScore) || isNaN(awayScore)) return;
    if (!stats[homeId] || !stats[awayId]) return;

    stats[homeId].mp += 1;
    stats[awayId].mp += 1;
    stats[homeId].gf += homeScore;
    stats[homeId].ga += awayScore;
    stats[awayId].gf += awayScore;
    stats[awayId].ga += homeScore;

    if (homeScore > awayScore) {
      stats[homeId].w += 1;
      stats[homeId].pts += 3;
      stats[awayId].l += 1;
    } else if (homeScore < awayScore) {
      stats[awayId].w += 1;
      stats[awayId].pts += 3;
      stats[homeId].l += 1;
    } else {
      stats[homeId].d += 1;
      stats[homeId].pts += 1;
      stats[awayId].d += 1;
      stats[awayId].pts += 1;
    }
  });

  Object.values(stats).forEach((s) => {
    s.gd = s.gf - s.ga;
  });

  return Object.values(stats).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.name.localeCompare(b.team.name);
  });
}

export default function GroupsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [predictionsLocked, setPredictionsLocked] = useState(false);
  const [allPredictions, setAllPredictions] = useState<StoredPrediction[]>([]);

  useEffect(() => {
    async function loadPredictions() {
      try {
        const response = await fetch("/api/predictions");
        const data = await response.json();
        setAllPredictions(data.predictions || []);
      } catch (error) {
        console.error("Error loading group predictions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPredictions();
  }, []);

  const standings = useMemo(() => {
    const result: GroupStandings = {};
    GROUP_STAGE_GROUPS.forEach((group) => {
      result[group.id] = calculateStandings(group, allPredictions);
    });
    return result;
  }, [allPredictions]);

  const matchCounts = useMemo(() => {
    const result: Record<string, number> = {};
    GROUP_STAGE_GROUPS.forEach((group) => {
      result[group.id] = countValidMatchPredictions(group, allPredictions);
    });
    return result;
  }, [allPredictions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500" />
          <p className="text-gray-500">Loading groups...</p>
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
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <CountdownTimer targetDate={PREDICTION_DEADLINE} variant="compact" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-5xl sm:text-6xl text-gray-900 mb-3">Group Stage</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Pick a group to predict all six matches with exact scores
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {GROUP_STAGE_GROUPS.map((group, index) => {
            const matchCount = matchCounts[group.id] || 0;
            const isComplete = matchCount === 6;
            const hasStarted = matchCount > 0;
            const groupStandings = standings[group.id] || [];

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`bg-white rounded-3xl p-5 border-2 cursor-pointer transition-all duration-200 ${
                  isComplete
                    ? "border-green-300 shadow-lg shadow-green-100"
                    : hasStarted
                    ? "border-blue-200 hover:border-blue-300 hover:shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}
                onClick={() => router.push(`/group-stage/${group.slug}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                      <span className="font-display text-xl text-white">{group.id}</span>
                    </div>
                    <h2 className="font-display text-xl text-gray-900">{group.name}</h2>
                  </div>
                  {isComplete ? (
                    <span className="wc-badge wc-badge-success">Done</span>
                  ) : hasStarted ? (
                    <span className="wc-badge bg-blue-100 text-blue-600 border border-blue-200">{matchCount}/6</span>
                  ) : (
                    <span className="wc-badge wc-badge-warning">Pending</span>
                  )}
                </div>

                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full min-w-[280px]">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="text-left py-2 pr-2">#</th>
                        <th className="text-left py-2 pr-2">Team</th>
                        <th className="text-center py-2 px-1">MP</th>
                        <th className="text-center py-2 px-1">W</th>
                        <th className="text-center py-2 px-1">D</th>
                        <th className="text-center py-2 px-1">L</th>
                        <th className="text-center py-2 pl-2 font-semibold">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupStandings.map((stat, position) => (
                        <tr
                          key={stat.team.id}
                          className={`border-b border-gray-50 last:border-0 ${
                            position === 0 ? "bg-yellow-50/50" : ""
                          }`}
                        >
                          <td className="py-2 pr-2">
                            <span className={`font-display text-sm font-bold ${
                              position === 0 ? "text-yellow-600" :
                              position === 1 ? "text-gray-400" :
                              position === 2 ? "text-amber-600" :
                              "text-gray-400"
                            }`}>
                              {position + 1}
                            </span>
                          </td>
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={getEmojiUrl(stat.team.flag)}
                                alt={stat.team.name}
                                className="w-5 h-4 rounded object-cover shadow-sm flex-shrink-0"
                                loading="lazy"
                              />
                              <span className="text-gray-900 text-sm font-medium truncate">
                                {stat.team.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-2 px-1 text-gray-600 text-sm">
                            {stat.mp}
                          </td>
                          <td className="text-center py-2 px-1 text-gray-600 text-sm">
                            {stat.w}
                          </td>
                          <td className="text-center py-2 px-1 text-gray-600 text-sm">
                            {stat.d}
                          </td>
                          <td className="text-center py-2 px-1 text-gray-600 text-sm">
                            {stat.l}
                          </td>
                          <td className="text-center py-2 pl-2">
                            <span className="font-bold text-gray-900 text-sm">
                              {stat.pts}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`mt-4 w-full py-3 rounded-xl text-center font-display text-sm font-bold uppercase tracking-wide transition-all ${
                  predictionsLocked
                    ? "bg-gray-100 text-gray-500"
                    : isComplete
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : hasStarted
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}>
                  {predictionsLocked ? "View" : isComplete ? "Edit" : hasStarted ? "Continue" : "Start"}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
