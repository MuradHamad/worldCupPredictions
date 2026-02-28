"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import CountdownTimer from "@/components/CountdownTimer";
import { PREDICTION_DEADLINE, arePredictionsOpen } from "@/lib/config";

interface Prediction {
  id: string;
  type: string;
  groupName: string | null;
  knockoutRound: string | null;
  teamOrder: string[];
  createdAt: string;
}

interface RoomLeaderboard {
  id: string;
  name: string;
  code: string;
  userScore: number;
  userRank: number;
  totalMembers: number;
  leaderboard: {
    rank: number;
    userId: string;
    name: string;
    image: string | null;
    score: number;
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [rooms, setRooms] = useState<RoomLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [predictionsLocked, setPredictionsLocked] = useState(!arePredictionsOpen());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [predictionsRes, roomsRes] = await Promise.all([
        fetch("/api/predictions"),
        fetch("/api/user/rooms")
      ]);

      const predictionsData = await predictionsRes.json();
      const roomsData = await roomsRes.json();

      setPredictions(predictionsData.predictions || []);
      setRooms(roomsData.rooms || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
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

  const hasGroupPredictions = predictions.some(p => p.type === "GROUP");
  const hasKnockoutPredictions = predictions.some(p => p.type === "KNOCKOUT");
  const hasThirdsPredictions = predictions.some(p => p.type === "THIRDS");
  const hasAnyPredictions = predictions.length > 0;
  const hasCompleteGroupStage = hasGroupPredictions && hasThirdsPredictions;

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0F2B]/90 backdrop-blur-xl border-b border-white/10">
        <div className="wc-container">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B3FE8] to-[#2535C7] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h1 className="font-display text-2xl text-white leading-none">PREDICTOR</h1>
                <p className="text-sm font-bold tracking-[0.2em] text-[#F5E642] mt-1">GLOBAL CUP 2026</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="w-10 h-10 rounded-xl" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B3FE8] to-[#E8152A] flex items-center justify-center">
                      <span className="text-white font-display text-lg">{session?.user?.name?.charAt(0) || "U"}</span>
                    </div>
                  )}
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all text-left"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span className="font-display text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[calc(100vw-100px)] px-0 py-12 min-h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          {/* Left Side - Predictions Summary (Larger - takes 3 columns) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="wc-card h-full">
              {/* Countdown Timer */}
              <div className="mb-6">
                <CountdownTimer
                  targetDate={PREDICTION_DEADLINE}
                  onLockChange={setPredictionsLocked}
                />
              </div>

              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-h3 text-white">Your Predictions</h2>
                <div className="flex gap-3">
                  {hasAnyPredictions && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/summary")}
                      className="wc-btn-secondary text-base py-3 px-6"
                    >
                      Summary
                    </motion.button>
                  )}
                  {hasAnyPredictions && !predictionsLocked && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(hasGroupPredictions && !hasThirdsPredictions ? "/thirds" : "/groups")}
                      className="wc-btn-primary text-base py-3 px-6"
                    >
                      Edit Predictions
                    </motion.button>
                  )}
                  {hasAnyPredictions && predictionsLocked && (
                    <div className="wc-btn-disabled text-base py-3 px-6 cursor-not-allowed">
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {!hasAnyPredictions ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-28 h-28 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border-2 border-white/10">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-body-large text-gray-400 mb-8">You haven&apos;t made any predictions yet</p>
                  {!predictionsLocked ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/groups")}
                      className="wc-btn-primary"
                    >
                      Make Predictions
                    </motion.button>
                  ) : (
                    <div className="wc-btn-disabled cursor-not-allowed">
                      Predictions Locked
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group Predictions Status */}
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#F5E642]/20 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#F5E642]">
                            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-white">Group Stage</h3>
                          <p className="text-gray-400">12 Groups</p>
                        </div>
                      </div>
                      {hasGroupPredictions ? (
                        <span className="wc-badge wc-badge-success">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Done
                        </span>
                      ) : (
                        <span className="wc-badge wc-badge-warning">Pending</span>
                      )}
                    </div>
                    {hasGroupPredictions && (
                      <p className="text-body-large text-gray-400">
                        {predictions.filter(p => p.type === "GROUP").length} groups predicted
                      </p>
                    )}
                  </div>

                  {/* Third Place Picks Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/thirds")}
                    className="p-6 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#F5E642]/20 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#F5E642]">
                            <path d="M12 15l-2 5 2-1 2 1-2-5zM12 2l2 5H10l2-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-white">Best 8 Thirds</h3>
                          <p className="text-gray-400">Select 8 third-placed teams</p>
                        </div>
                      </div>
                      {hasThirdsPredictions ? (
                        <span className="wc-badge wc-badge-success">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Done
                        </span>
                      ) : hasGroupPredictions ? (
                        <span className="wc-badge wc-badge-warning">Pending</span>
                      ) : (
                        <span className="wc-badge bg-gray-500/20 text-gray-400 border border-gray-500/30">Locked</span>
                      )}
                    </div>
                    {hasThirdsPredictions && (
                      <p className="text-body-large text-gray-400">
                        8 third-placed teams selected
                      </p>
                    )}
                  </motion.div>

                  {/* Knockout Predictions Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/knockouts")}
                    className="p-6 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#2B3FE8]/20 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#2B3FE8]">
                            <path d="M8 21h8M12 17v4M7 4h10v9a5 5 0 01-10 0V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-white">Knockout Stage</h3>
                          <p className="text-gray-400">Round of 32 to Final</p>
                        </div>
                      </div>
                      {hasKnockoutPredictions ? (
                        <span className="wc-badge wc-badge-success">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Done
                        </span>
                      ) : (
                        <span className="wc-badge wc-badge-warning">Pending</span>
                      )}
                    </div>
                    {hasKnockoutPredictions ? (
                      <p className="text-body-large text-gray-400">
                        {predictions.filter(p => p.type === "KNOCKOUT").length} rounds predicted
                      </p>
                    ) : (
                      <p className="text-body text-gray-400">
                        Click to predict winners
                      </p>
                    )}
                  </motion.div>

                  {/* Prediction Summary */}
                  {hasGroupPredictions && (
                    <div className="md:col-span-2 p-6 bg-white/5 rounded-2xl border border-white/10">
                      <h3 className="font-display text-xl text-white mb-4">Prediction Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <p className="font-display text-3xl wc-text-gradient mb-1">
                            {predictions.filter(p => p.type === "GROUP").length}
                          </p>
                          <p className="text-gray-400 text-sm">Groups</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <p className="font-display text-3xl text-[#F5E642] mb-1">
                            {predictions.filter(p => p.type === "GROUP").length * 4}
                          </p>
                          <p className="text-gray-400 text-sm">Teams Ranked</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <p className="font-display text-3xl text-[#2B3FE8] mb-1">
                            {predictions.filter(p => p.type === "KNOCKOUT").length > 0 ? "Yes" : "No"}
                          </p>
                          <p className="text-gray-400 text-sm">Knockouts</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <p className="font-display text-3xl text-white mb-1">
                            {rooms[0]?.userScore || 0}
                          </p>
                          <p className="text-gray-400 text-sm">Your Points</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Side - Leaderboard (Narrower - takes 1 column) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="wc-card h-full">
              <h2 className="font-display text-h4 text-white mb-6">Leaderboard</h2>

              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-body text-gray-400 mb-6">Not in any room yet</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/rooms")}
                    className="wc-btn-primary text-base py-3 px-6 w-full"
                  >
                    Join Room
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room) => (
                    <div key={room.id}>
                      {/* Room Header */}
                      <div className="bg-gradient-to-r from-[#2B3FE8] to-[#2535C7] rounded-2xl px-5 py-4 mb-4">
                        <h3 className="font-display text-xl text-white">{room.name}</h3>
                        <p className="text-white/60 text-sm font-mono">{room.code}</p>
                      </div>
                      
                      {/* User Rank */}
                      <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl">
                        <span className="text-gray-400">Your Rank</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-4xl wc-text-gradient">
                            #{room.userRank}
                          </span>
                          <span className="text-gray-500 text-lg">
                            / {room.totalMembers}
                          </span>
                        </div>
                      </div>
                      
                      {/* Leaderboard List */}
                      <div className="space-y-3">
                        {room.leaderboard.slice(0, 5).map((member) => (
                          <div
                            key={member.userId}
                            className={`flex items-center justify-between py-3 px-4 rounded-xl ${
                                member.userId === session?.user?.id
                                  ? "bg-[#E8152A]/10 border border-[#E8152A]/30"
                                  : "bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-display text-lg w-8 ${
                                member.rank === 1 ? "text-[#FFD700]" :
                                member.rank === 2 ? "text-gray-300" :
                                member.rank === 3 ? "text-[#CD7F32]" :
                                "text-gray-500"
                              }`}>
                                #{member.rank}
                              </span>
                              <span className="text-body-large text-white">
                                {member.name}
                                {member.userId === session?.user?.id && (
                                  <span className="text-[#E8152A] ml-2">(You)</span>
                                )}
                              </span>
                            </div>
                            <span className="font-display text-xl text-white">{member.score}</span>
                          </div>
                        ))}
                        {room.leaderboard.length > 5 && (
                          <p className="text-center text-gray-500 text-sm pt-2">
                            +{room.leaderboard.length - 5} more players
                          </p>
                        )}
                      </div>
                      
                      {/* View Full Leaderboard Link */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/leaderboard")}
                        className="w-full mt-4 py-2 text-center text-[#2B3FE8] hover:text-[#3B4FF8] text-sm font-display transition-colors"
                      >
                        View Full Leaderboard →
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
