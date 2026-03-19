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

const TOTAL_GROUP_MATCHES = 72;
const TOTAL_THIRDS = 8;
const TOTAL_KNOCKOUT_MATCHES = 32;

function countValidGroupMatchPredictions(predictions: Prediction[]): number {
  let totalMatches = 0;
  
  predictions.forEach(pred => {
    if (pred.type === "GROUP" && pred.teamOrder) {
      pred.teamOrder.forEach(entry => {
        if (entry.startsWith("MATCH|")) {
          const parts = entry.split("|");
          if (parts.length === 4) {
            const scoreStr = parts[3];
            const [home, away] = scoreStr.split("-").map(Number);
            if (!isNaN(home) && !isNaN(away) && home >= 0 && away >= 0) {
              totalMatches++;
            }
          }
        }
      });
    }
  });
  
  return totalMatches;
}

function countThirdsSelected(predictions: Prediction[]): number {
  const thirdsPred = predictions.find(p => p.type === "THIRDS");
  if (!thirdsPred || !thirdsPred.teamOrder) return 0;
  return thirdsPred.teamOrder.length;
}

function countKnockoutMatchesPredicted(predictions: Prediction[]): number {
  return predictions
    .filter(p => p.type === "KNOCKOUT" && p.teamOrder)
    .reduce((total, p) => total + p.teamOrder.length, 0);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const validGroupMatches = countValidGroupMatchPredictions(predictions);
  const thirdsSelected = countThirdsSelected(predictions);
  const knockoutMatches = countKnockoutMatchesPredicted(predictions);

  const groupsComplete = validGroupMatches === TOTAL_GROUP_MATCHES;
  const groupsStarted = validGroupMatches > 0;
  const thirdsComplete = thirdsSelected === TOTAL_THIRDS;
  const thirdsStarted = thirdsSelected > 0;
  const knockoutsComplete = knockoutMatches === TOTAL_KNOCKOUT_MATCHES;
  const knockoutsStarted = knockoutMatches > 0;
  const hasAnyValidPredictions = groupsStarted || thirdsStarted || knockoutsStarted;

  return (
    <div className="min-h-screen bg-gray-50 ">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="wc-container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="white" />
                  <circle cx="12" cy="12" r="4" fill="#fe1644" />
                </svg>
              </div>
              <div>
                <span className="font-display text-xl text-gray-900">GLOBAL CUP</span>
                <span className="font-display text-sm text-gray-500 ml-2">2026</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <CountdownTimer
                targetDate={PREDICTION_DEADLINE}
                variant="subtle"
                className="hidden sm:flex"
              />
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="w-9 h-9 rounded-xl" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-display text-base">{session?.user?.name?.charAt(0) || "U"}</span>
                    </div>
                  )}
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all text-left"
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

      <main className="wc-container py-8 mx-[15px] mt-[15px] mb-[15px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 mb-10">
          <div className="lg:col-span-2 mx-0 mt-[15px] mb-[15px]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-3xl text-gray-900">Your Predictions</h1>
              {hasAnyValidPredictions && !predictionsLocked && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(!groupsComplete && groupsStarted ? "/thirds" : "/groups")}
                  className="wc-btn-primary text-sm py-3 px-6"
                >
                  Edit
                </motion.button>
              )}
            </div>

            {!hasAnyValidPredictions ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-12 border-2 border-gray-200 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-xl mb-6">No predictions yet</p>
                {!predictionsLocked && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/groups")}
                    className="wc-btn-primary"
                  >
                    Start Predicting
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="wc-progress-card cursor-pointer"
                  onClick={() => router.push("/groups")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-500">
                          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-gray-900">Groups</h3>
                        <p className="text-gray-500 text-sm">12 groups</p>
                      </div>
                    </div>
                    {groupsComplete ? (
                      <span className="wc-badge wc-badge-success">Done</span>
                    ) : groupsStarted ? (
                      <span className="wc-badge bg-blue-100 text-blue-600 border border-blue-200">{validGroupMatches}/72</span>
                    ) : (
                      <span className="wc-badge wc-badge-warning">Pending</span>
                    )}
                  </div>
                  {groupsStarted && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        {validGroupMatches}/72 matches predicted
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="wc-progress-card cursor-pointer"
                  onClick={() => router.push("/thirds")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-600">
                          <path d="M12 15l-2 5 2-1 2 1-2-5zM12 2l2 5H10l2-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-gray-900">Best 8 Thirds</h3>
                        <p className="text-gray-500 text-sm">Advance to knockouts</p>
                      </div>
                    </div>
                    {thirdsComplete ? (
                      <span className="wc-badge wc-badge-success">Done</span>
                    ) : thirdsStarted ? (
                      <span className="wc-badge bg-blue-100 text-blue-600 border border-blue-200">{thirdsSelected}/8</span>
                    ) : groupsStarted ? (
                      <span className="wc-badge wc-badge-warning">Pending</span>
                    ) : (
                      <span className="wc-badge bg-gray-100 text-gray-500 border border-gray-200">Locked</span>
                    )}
                  </div>
                  {thirdsStarted && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        {thirdsSelected}/8 teams selected
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="wc-progress-card cursor-pointer sm:col-span-2"
                  onClick={() => router.push("/knockouts")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                          <path d="M8 21h8M12 17v4M7 4h10v9a5 5 0 01-10 0V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-gray-900">Knockouts</h3>
                        <p className="text-gray-500 text-sm">R32 to Final</p>
                      </div>
                    </div>
                    {knockoutsComplete ? (
                      <span className="wc-badge wc-badge-success">Done</span>
                    ) : knockoutsStarted ? (
                      <span className="wc-badge bg-blue-100 text-blue-600 border border-blue-200">{knockoutMatches}/32</span>
                    ) : groupsStarted ? (
                      <span className="wc-badge wc-badge-warning">Pending</span>
                    ) : (
                      <span className="wc-badge wc-badge-pending">Locked</span>
                    )}
                  </div>
                  {knockoutsStarted && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        {knockoutMatches}/32 matches predicted
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-2xl text-gray-900 mb-6">Leaderboard</h2>

            {rooms.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Not in any room</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/rooms")}
                  className="wc-btn-secondary text-sm py-3 px-6"
                >
                  Join Room
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 border-2 border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-display text-sm">{room.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-gray-900 truncate">{room.name}</h3>
                        <p className="text-gray-400 text-sm font-mono">{room.code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-sm">Your Rank</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                          #{room.userRank}
                        </span>
                        <span className="text-gray-400 text-sm">/ {room.totalMembers}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {room.leaderboard.slice(0, 5).map((member) => (
                        <div
                          key={member.userId}
                          className={`flex items-center justify-between py-2 px-3 rounded-xl ${
                            member.userId === session?.user?.id
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-sm w-6 ${
                              member.rank === 1 ? "text-yellow-500" :
                              member.rank === 2 ? "text-gray-400" :
                              member.rank === 3 ? "text-amber-600" :
                              "text-gray-400"
                            }`}>
                              #{member.rank}
                            </span>
                            <span className="text-gray-700 text-sm truncate max-w-[120px]">
                              {member.name}
                              {member.userId === session?.user?.id && (
                                <span className="text-red-500 ml-1">(You)</span>
                              )}
                            </span>
                          </div>
                          <span className="font-display text-gray-900">{member.score}</span>
                        </div>
                      ))}
                    </div>
                    
                    {room.leaderboard.length > 5 && (
                      <p className="text-center text-gray-400 text-sm pt-3">
                        +{room.leaderboard.length - 5} more players
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
