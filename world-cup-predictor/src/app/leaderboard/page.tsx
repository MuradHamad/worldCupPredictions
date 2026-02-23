"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  userImage: string | null;
  score: number;
  predictionsCount: number;
}

interface Room {
  id: string;
  name: string;
  code: string;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchRooms();
    }
  }, [session]);

  useEffect(() => {
    if (selectedRoomId) {
      fetchLeaderboard(selectedRoomId);
    }
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/user/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
      
      // Select first room by default
      if (data.rooms?.length > 0) {
        setSelectedRoomId(data.rooms[0].id);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async (roomId: string) => {
    try {
      const res = await fetch(`/api/leaderboard?roomId=${roomId}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const handleRecalculateScores = async () => {
    if (!selectedRoomId) return;
    
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: selectedRoomId })
      });
      const data = await res.json();
      
      if (data.success) {
        // Refresh leaderboard
        fetchLeaderboard(selectedRoomId);
      }
    } catch (error) {
      console.error("Error calculating scores:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#8B4513] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </div>
      );
    }
    return (
      <span className="font-display text-lg text-gray-500 w-8 text-center">
        #{rank}
      </span>
    );
  };

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
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#2B3FE8]/5 rounded-full blur-3xl" />
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
          <span className="text-xs tracking-[0.4em] uppercase text-gray-500">Leaderboard</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-h2 text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-body-large text-gray-400 max-w-2xl mx-auto">
            See how you stack up against other predictors in your room
          </p>
        </motion.div>

        {/* Room Selector */}
        {rooms.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <label className="text-gray-400 text-body">Room:</label>
              <select
                value={selectedRoomId || ""}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-display focus:outline-none focus:border-[#2B3FE8]"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id} className="bg-[#1a1a1a]">
                    {room.name} ({room.code})
                  </option>
                ))}
              </select>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRecalculateScores}
              disabled={isRecalculating || !selectedRoomId}
              className="wc-btn-secondary text-base py-2 px-4 flex items-center gap-2 disabled:opacity-50"
            >
              {isRecalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Calculating...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Recalculate Scores
                </>
              )}
            </motion.button>
          </div>
        )}

        {!selectedRoomId || rooms.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-28 h-28 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border-2 border-white/10">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-body-large text-gray-400 mb-2">You&apos;re not in any room yet</p>
            <p className="text-body text-gray-500 mb-8">Join a room to see the leaderboard</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/rooms")}
              className="wc-btn-primary"
            >
              Join Room
            </motion.button>
          </motion.div>
        ) : leaderboard.length === 0 ? (
          /* No Scores Yet */
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
            <p className="text-body-large text-gray-400 mb-2">No scores calculated yet</p>
            <p className="text-body text-gray-500 mb-8">Add match results and recalculate to see rankings</p>
          </motion.div>
        ) : (
          /* Leaderboard Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="wc-card max-w-3xl mx-auto"
          >
            {/* Header Podium for Top 3 */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8 pt-8">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    {leaderboard[1].userImage ? (
                      <img 
                        src={leaderboard[1].userImage} 
                        alt={leaderboard[1].userName || ""}
                        className="w-16 h-16 rounded-full border-4 border-[#C0C0C0]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0] flex items-center justify-center border-4 border-[#C0C0C0]">
                        <span className="text-2xl text-white font-display">
                          {leaderboard[1].userName?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center">
                      <span className="text-white font-display text-sm">2</span>
                    </div>
                  </div>
                  <p className="text-white font-display text-lg mb-1 truncate max-w-[100px]">
                    {leaderboard[1].userName || "Anonymous"}
                  </p>
                  <p className="text-[#C0C0C0] font-display text-2xl">{leaderboard[1].score}</p>
                  <div className="w-20 h-24 bg-gradient-to-t from-[#C0C0C0]/20 to-transparent rounded-t-xl mt-2" />
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    {leaderboard[0].userImage ? (
                      <img 
                        src={leaderboard[0].userImage} 
                        alt={leaderboard[0].userName || ""}
                        className="w-20 h-20 rounded-full border-4 border-[#FFD700]"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center border-4 border-[#FFD700]">
                        <span className="text-3xl text-white font-display">
                          {leaderboard[0].userName?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FFD700] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-white font-display text-xl mb-1 truncate max-w-[120px]">
                    {leaderboard[0].userName || "Anonymous"}
                  </p>
                  <p className="text-[#FFD700] font-display text-3xl">{leaderboard[0].score}</p>
                  <div className="w-24 h-32 bg-gradient-to-t from-[#FFD700]/20 to-transparent rounded-t-xl mt-2" />
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    {leaderboard[2].userImage ? (
                      <img 
                        src={leaderboard[2].userImage} 
                        alt={leaderboard[2].userName || ""}
                        className="w-14 h-14 rounded-full border-4 border-[#CD7F32]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#8B4513] flex items-center justify-center border-4 border-[#CD7F32]">
                        <span className="text-xl text-white font-display">
                          {leaderboard[2].userName?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center">
                      <span className="text-white font-display text-sm">3</span>
                    </div>
                  </div>
                  <p className="text-white font-display text-lg mb-1 truncate max-w-[100px]">
                    {leaderboard[2].userName || "Anonymous"}
                  </p>
                  <p className="text-[#CD7F32] font-display text-2xl">{leaderboard[2].score}</p>
                  <div className="w-16 h-16 bg-gradient-to-t from-[#CD7F32]/20 to-transparent rounded-t-xl mt-2" />
                </motion.div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="space-y-2 px-4 pb-4">
              {leaderboard.slice(3).map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    entry.userId === session?.user?.id
                      ? "bg-[#E8152A]/10 border border-[#E8152A]/30"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    {entry.userImage ? (
                      <img 
                        src={entry.userImage} 
                        alt={entry.userName || ""}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-white font-display">
                          {entry.userName?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-body-large text-white">
                        {entry.userName || "Anonymous"}
                        {entry.userId === session?.user?.id && (
                          <span className="text-[#E8152A] ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {entry.predictionsCount} predictions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl text-white">{entry.score}</p>
                    <p className="text-gray-500 text-xs">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
