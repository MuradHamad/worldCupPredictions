"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import CountdownTimer from "@/components/CountdownTimer";
import { PREDICTION_DEADLINE, arePredictionsOpen } from "@/lib/config";

interface Team {
  id: string;
  name: string;
  flag: string;
}

interface Group {
  id: string;
  name: string;
  teams: Team[];
}

interface Prediction {
  id: string;
  type: string;
  groupName: string | null;
  knockoutRound: string | null;
  teamOrder: string[];
  createdAt: string;
}

const groups: Group[] = [
  { id: "A", name: "Group A", teams: [{ id: "mex", name: "Mexico", flag: "🇲🇽" }, { id: "rsa", name: "South Africa", flag: "🇿🇦" }, { id: "kor", name: "South Korea", flag: "🇰🇷" }, { id: "eur-d", name: "Euro Playoff D", flag: "🏆" }] },
  { id: "B", name: "Group B", teams: [{ id: "can", name: "Canada", flag: "🇨🇦" }, { id: "eur-a", name: "Euro Playoff A", flag: "🏆" }, { id: "qat", name: "Qatar", flag: "🇶🇦" }, { id: "sui", name: "Switzerland", flag: "🇨🇭" }] },
  { id: "C", name: "Group C", teams: [{ id: "bra", name: "Brazil", flag: "🇧🇷" }, { id: "mar", name: "Morocco", flag: "🇲🇦" }, { id: "hai", name: "Haiti", flag: "🇭🇹" }, { id: "sco", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }] },
  { id: "D", name: "Group D", teams: [{ id: "usa", name: "United States", flag: "🇺🇸" }, { id: "par", name: "Paraguay", flag: "🇵🇾" }, { id: "aus", name: "Australia", flag: "🇦🇺" }, { id: "eur-c", name: "Euro Playoff C", flag: "🏆" }] },
  { id: "E", name: "Group E", teams: [{ id: "ger", name: "Germany", flag: "🇩🇪" }, { id: "cur", name: "Curaçao", flag: "🇨🇼" }, { id: "civ", name: "Ivory Coast", flag: "🇨🇮" }, { id: "ecu", name: "Ecuador", flag: "🇪🇨" }] },
  { id: "F", name: "Group F", teams: [{ id: "ned", name: "Netherlands", flag: "🇳🇱" }, { id: "jpn", name: "Japan", flag: "🇯🇵" }, { id: "eur-b", name: "Euro Playoff B", flag: "🏆" }, { id: "tun", name: "Tunisia", flag: "🇹🇳" }] },
  { id: "G", name: "Group G", teams: [{ id: "bel", name: "Belgium", flag: "🇧🇪" }, { id: "egy", name: "Egypt", flag: "🇪🇬" }, { id: "irn", name: "Iran", flag: "🇮🇷" }, { id: "nzl", name: "New Zealand", flag: "🇳🇿" }] },
  { id: "H", name: "Group H", teams: [{ id: "esp", name: "Spain", flag: "🇪🇸" }, { id: "cpv", name: "Cape Verde", flag: "🇨🇻" }, { id: "ksa", name: "Saudi Arabia", flag: "🇸🇦" }, { id: "uru", name: "Uruguay", flag: "🇺🇾" }] },
  { id: "I", name: "Group I", teams: [{ id: "fra", name: "France", flag: "🇫🇷" }, { id: "sen", name: "Senegal", flag: "🇸🇳" }, { id: "playoff-2", name: "Playoff Slot 2", flag: "🏆" }, { id: "nor", name: "Norway", flag: "🇳🇴" }] },
  { id: "J", name: "Group J", teams: [{ id: "arg", name: "Argentina", flag: "🇦🇷" }, { id: "alg", name: "Algeria", flag: "🇩🇿" }, { id: "aut", name: "Austria", flag: "🇦🇹" }, { id: "jor", name: "Jordan", flag: "🇯🇴" }] },
  { id: "K", name: "Group K", teams: [{ id: "por", name: "Portugal", flag: "🇵🇹" }, { id: "playoff-1", name: "Playoff Slot 1", flag: "🏆" }, { id: "uzb", name: "Uzbekistan", flag: "🇺🇿" }, { id: "col", name: "Colombia", flag: "🇨🇴" }] },
  { id: "L", name: "Group L", teams: [{ id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { id: "cro", name: "Croatia", flag: "🇭🇷" }, { id: "gha", name: "Ghana", flag: "🇬🇭" }, { id: "pan", name: "Panama", flag: "🇵🇦" }] },
];

const knockoutTeams: Team[] = [
  { id: "mex", name: "Mexico", flag: "🇲🇽" }, { id: "can", name: "Canada", flag: "🇨🇦" },
  { id: "bra", name: "Brazil", flag: "🇧🇷" }, { id: "ger", name: "Germany", flag: "🇩🇪" },
  { id: "esp", name: "Spain", flag: "🇪🇸" }, { id: "fra", name: "France", flag: "🇫🇷" },
  { id: "arg", name: "Argentina", flag: "🇦🇷" }, { id: "por", name: "Portugal", flag: "🇵🇹" },
  { id: "ned", name: "Netherlands", flag: "🇳🇱" }, { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "bel", name: "Belgium", flag: "🇧🇪" }, { id: "ita", name: "Italy", flag: "🇮🇹" },
  { id: "cro", name: "Croatia", flag: "🇭🇷" }, { id: "uru", name: "Uruguay", flag: "🇺🇾" },
  { id: "usa", name: "USA", flag: "🇺🇸" }, { id: "jpn", name: "Japan", flag: "🇯🇵" },
  { id: "kor", name: "South Korea", flag: "🇰🇷" }, { id: "aus", name: "Australia", flag: "🇦🇺" },
  { id: "sui", name: "Switzerland", flag: "🇨🇭" }, { id: "mar", name: "Morocco", flag: "🇲🇦" },
  { id: "egy", name: "Egypt", flag: "🇪🇬" }, { id: "sen", name: "Senegal", flag: "🇸🇳" },
  { id: "tun", name: "Tunisia", flag: "🇹🇳" }, { id: "qat", name: "Qatar", flag: "🇶🇦" },
  { id: "ecu", name: "Ecuador", flag: "🇪🇨" }, { id: "rsa", name: "South Africa", flag: "🇿🇦" },
  { id: "nir", name: "Northern Ireland", flag: "🇳🇫" }, { id: "irn", name: "Iran", flag: "🇮🇷" },
  { id: "ksa", name: "Saudi Arabia", flag: "🇸🇦" },
];

const emojiToCodepoint = (emoji: string) =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

const getEmojiUrl = (emoji: string) =>
  `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

export default function SummaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [predictionsLocked, setPredictionsLocked] = useState(!arePredictionsOpen());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPredictions();
    }
  }, [session]);

  const fetchPredictions = async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupPrediction = (groupId: string): Prediction | undefined => {
    return predictions.find((p) => p.type === "GROUP" && p.groupName === groupId);
  };

  const getTeamById = (teamId: string): Team | undefined => {
    for (const group of groups) {
      const team = group.teams.find((t) => t.id === teamId);
      if (team) return team;
    }
    return knockoutTeams.find((t) => t.id === teamId);
  };

  const groupPredictions = predictions.filter((p) => p.type === "GROUP");
  const knockoutPredictions = predictions.filter((p) => p.type === "KNOCKOUT");
  const hasAnyPredictions = groupPredictions.length > 0;
  const hasKnockoutPredictions = knockoutPredictions.length > 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="wc-container">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className="text-sm tracking-widest uppercase text-gray-400">Summary</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-5xl text-gray-900 mb-3">Your Predictions</h1>
          <p className="text-gray-500 text-lg">Review your group stage predictions</p>
        </motion.div>

        <div className="mb-8">
          <CountdownTimer
            targetDate={PREDICTION_DEADLINE}
            onLockChange={setPredictionsLocked}
          />
        </div>

        {!hasAnyPredictions ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-16 border-2 border-gray-200 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-gray-500 text-xl mb-6">No predictions yet</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/groups")}
              className="wc-btn-primary"
            >
              Make Predictions
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-gray-900">Group Stage</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/groups")}
                  className="wc-btn-outline text-sm py-2 px-5"
                >
                  Edit
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {groups.map((group, groupIndex) => {
                  const prediction = getGroupPrediction(group.id);
                  const predictedOrder = prediction?.teamOrder || group.teams.map(t => t.id);

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.04 }}
                      className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <span className="font-display text-xl text-white">{group.id}</span>
                        </div>
                        <h3 className="font-display text-lg text-gray-900">{group.name}</h3>
                      </div>

                      <div className="space-y-2">
                        {predictedOrder.map((teamId, index) => {
                          const team = getTeamById(teamId);
                          if (!team) return null;

                          const isWinner = index === 0;
                          const isRunnerUp = index === 1;

                          return (
                            <div
                              key={`${group.id}-${teamId}`}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isWinner
                                  ? "bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400"
                                  : isRunnerUp
                                  ? "bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300"
                                  : "bg-gray-50 border-2 border-gray-100"
                              }`}
                            >
                              <span className={`font-display text-lg w-6 ${
                                isWinner ? "text-yellow-500" : isRunnerUp ? "text-gray-400" : "text-gray-300"
                              }`}>
                                {index + 1}
                              </span>
                              <img
                                src={getEmojiUrl(team.flag)}
                                alt={`${team.name} flag`}
                                className="w-6 h-4 rounded-sm object-cover"
                                loading="lazy"
                              />
                              <span className={`text-sm flex-1 ${
                                isWinner ? "text-gray-900 font-semibold" : "text-gray-600"
                              }`}>
                                {team.name}
                              </span>
                              {isWinner && (
                                <span className="text-xs font-display text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
                                  1ST
                                </span>
                              )}
                              {isRunnerUp && (
                                <span className="text-xs font-display text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                                  2ND
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-white rounded-3xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                        <path d="M8 21h8M12 17v4M7 4h10v9a5 5 0 01-10 0V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-gray-900">Knockout Stage</h2>
                      <p className="text-gray-500 text-sm">Round of 32 to Final</p>
                    </div>
                  </div>
                  {hasKnockoutPredictions && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/knockouts")}
                      className="wc-btn-outline text-sm py-2 px-4"
                    >
                      Edit
                    </motion.button>
                  )}
                </div>

                {hasKnockoutPredictions ? (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {knockoutPredictions.slice(0, 8).map((pred) => {
                        const winner = pred.teamOrder[0];
                        const team = getTeamById(winner);
                        if (!team) return null;
                        return (
                          <div key={pred.id} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200">
                            <img
                              src={getEmojiUrl(team.flag)}
                              alt={`${team.name} flag`}
                              className="w-5 h-4 rounded-sm"
                            />
                            <span className="text-sm text-gray-900 truncate">{team.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      {knockoutPredictions.length} predictions made
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                    <p className="text-gray-500 mb-3">Make your knockout predictions</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/knockouts")}
                      className="wc-btn-secondary text-sm py-3 px-6"
                    >
                      Predict Winners
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
