"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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
  {
    id: "A",
    name: "Group A",
    teams: [
      { id: "mex", name: "Mexico", flag: "🇲🇽" },
      { id: "rsa", name: "South Africa", flag: "🇿🇦" },
      { id: "kor", name: "South Korea", flag: "🇰🇷" },
      { id: "eur-d", name: "Euro Playoff D", flag: "🏆" },
    ],
  },
  {
    id: "B",
    name: "Group B",
    teams: [
      { id: "can", name: "Canada", flag: "🇨🇦" },
      { id: "eur-a", name: "Euro Playoff A", flag: "🏆" },
      { id: "qat", name: "Qatar", flag: "🇶🇦" },
      { id: "sui", name: "Switzerland", flag: "🇨🇭" },
    ],
  },
  {
    id: "C",
    name: "Group C",
    teams: [
      { id: "bra", name: "Brazil", flag: "🇧🇷" },
      { id: "mar", name: "Morocco", flag: "🇲🇦" },
      { id: "hai", name: "Haiti", flag: "🇭🇹" },
      { id: "sco", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    ],
  },
  {
    id: "D",
    name: "Group D",
    teams: [
      { id: "usa", name: "United States", flag: "🇺🇸" },
      { id: "par", name: "Paraguay", flag: "🇵🇾" },
      { id: "aus", name: "Australia", flag: "🇦🇺" },
      { id: "eur-c", name: "Euro Playoff C", flag: "🏆" },
    ],
  },
  {
    id: "E",
    name: "Group E",
    teams: [
      { id: "ger", name: "Germany", flag: "🇩🇪" },
      { id: "cur", name: "Curaçao", flag: "🇨🇼" },
      { id: "civ", name: "Ivory Coast", flag: "🇨🇮" },
      { id: "ecu", name: "Ecuador", flag: "🇪🇨" },
    ],
  },
  {
    id: "F",
    name: "Group F",
    teams: [
      { id: "ned", name: "Netherlands", flag: "🇳🇱" },
      { id: "jpn", name: "Japan", flag: "🇯🇵" },
      { id: "eur-b", name: "Euro Playoff B", flag: "🏆" },
      { id: "tun", name: "Tunisia", flag: "🇹🇳" },
    ],
  },
  {
    id: "G",
    name: "Group G",
    teams: [
      { id: "bel", name: "Belgium", flag: "🇧🇪" },
      { id: "egy", name: "Egypt", flag: "🇪🇬" },
      { id: "irn", name: "Iran", flag: "🇮🇷" },
      { id: "nzl", name: "New Zealand", flag: "🇳🇿" },
    ],
  },
  {
    id: "H",
    name: "Group H",
    teams: [
      { id: "esp", name: "Spain", flag: "🇪🇸" },
      { id: "cpv", name: "Cape Verde", flag: "🇨🇻" },
      { id: "ksa", name: "Saudi Arabia", flag: "🇸🇦" },
      { id: "uru", name: "Uruguay", flag: "🇺🇾" },
    ],
  },
  {
    id: "I",
    name: "Group I",
    teams: [
      { id: "fra", name: "France", flag: "🇫🇷" },
      { id: "sen", name: "Senegal", flag: "🇸🇳" },
      { id: "playoff-2", name: "Playoff Slot 2", flag: "🏆" },
      { id: "nor", name: "Norway", flag: "🇳🇴" },
    ],
  },
  {
    id: "J",
    name: "Group J",
    teams: [
      { id: "arg", name: "Argentina", flag: "🇦🇷" },
      { id: "alg", name: "Algeria", flag: "🇩🇿" },
      { id: "aut", name: "Austria", flag: "🇦🇹" },
      { id: "jor", name: "Jordan", flag: "🇯🇴" },
    ],
  },
  {
    id: "K",
    name: "Group K",
    teams: [
      { id: "por", name: "Portugal", flag: "🇵🇹" },
      { id: "playoff-1", name: "Playoff Slot 1", flag: "🏆" },
      { id: "uzb", name: "Uzbekistan", flag: "🇺🇿" },
      { id: "col", name: "Colombia", flag: "🇨🇴" },
    ],
  },
  {
    id: "L",
    name: "Group L",
    teams: [
      { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "cro", name: "Croatia", flag: "🇭🇷" },
      { id: "gha", name: "Ghana", flag: "🇬🇭" },
      { id: "pan", name: "Panama", flag: "🇵🇦" },
    ],
  },
];

export default function SummaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    return predictions.find(
      (p) => p.type === "GROUP" && p.groupName === groupId
    );
  };

  const getTeamById = (teamId: string): Team | undefined => {
    for (const group of groups) {
      const team = group.teams.find((t) => t.id === teamId);
      if (team) return team;
    }
    return undefined;
  };

  const emojiToCodepoint = (emoji: string) =>
    Array.from(emoji)
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join("-");

  const getEmojiUrl = (emoji: string) =>
    `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

  const groupPredictions = predictions.filter((p) => p.type === "GROUP");
  const hasAnyPredictions = groupPredictions.length > 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#2B3FE8] border-t-transparent"></div>
          <p className="text-gray-400 text-body-large">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page py-12">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2B3FE8]/10 via-transparent to-[#E8152A]/10" />
      </div>

      <div className="wc-container relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-body"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </button>
          <span className="text-xs tracking-[0.4em] uppercase text-gray-500">Summary</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-h2 text-white mb-4">
            Your Predictions
          </h1>
          <p className="text-body-large text-gray-400 max-w-2xl mx-auto">
            Review your group stage predictions. Predicted winners are highlighted.
          </p>
        </motion.div>

        {!hasAnyPredictions ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-28 h-28 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border-2 border-white/10">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-body-large text-gray-400 mb-8">You haven&apos;t made any predictions yet</p>
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
            {/* Group Predictions */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-h4 text-white">Group Stage Predictions</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/groups")}
                  className="wc-btn-secondary text-base py-3 px-6"
                >
                  Edit Predictions
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groups.map((group, groupIndex) => {
                  const prediction = getGroupPrediction(group.id);
                  const predictedOrder = prediction?.teamOrder || group.teams.map(t => t.id);

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.05 }}
                      className="wc-card"
                    >
                      {/* Group Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B3FE8] to-[#2535C7] flex items-center justify-center">
                          <span className="font-display text-2xl text-white">{group.id}</span>
                        </div>
                        <h3 className="font-display text-xl text-white">{group.name}</h3>
                      </div>

                      {/* Teams List */}
                      <div className="space-y-2">
                        {predictedOrder.map((teamId, index) => {
                          const team = getTeamById(teamId);
                          if (!team) return null;

                          const isWinner = index === 0;

                          return (
                            <div
                              key={`${group.id}-${teamId}`}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isWinner
                                  ? "bg-[#F5E642]/10 border border-[#F5E642]/30"
                                  : "bg-white/5 border border-white/10"
                              }`}
                            >
                              <span className={`font-display text-lg w-6 ${
                                isWinner ? "text-[#F5E642]" : "text-gray-500"
                              }`}>
                                {index + 1}
                              </span>
                              <img
                                src={getEmojiUrl(team.flag)}
                                alt={`${team.name} flag`}
                                className="w-6 h-4 rounded-sm object-cover shadow"
                                loading="lazy"
                              />
                              <span className={`text-body flex-1 ${
                                isWinner ? "text-white font-semibold" : "text-gray-300"
                              }`}>
                                {team.name}
                              </span>
                              {isWinner && (
                                <span className="text-xs font-display text-[#F5E642] bg-[#F5E642]/20 px-2 py-1 rounded">
                                  WINNER
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

            {/* Knockout Predictions - Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="wc-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2B3FE8]/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#2B3FE8]">
                      <path d="M8 21h8M12 17v4M7 4h10v9a5 5 0 01-10 0V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display text-h4 text-white">Knockout Stage</h2>
                    <p className="text-gray-400 text-body">Round of 32 to Final</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-body-large text-gray-300 mb-2">
                    Knockout predictions will be available in Phase 2
                  </p>
                  <p className="text-body text-gray-500">
                    Stay tuned for the Round of 32, Quarter Finals, Semi Finals, and Final predictions!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
