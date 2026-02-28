"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import CountdownTimer from "@/components/CountdownTimer";
import { PREDICTION_DEADLINE, arePredictionsOpen } from "@/lib/config";

interface Team {
  id: string;
  name: string;
  flag: string;
}

const allTeamsInGroups: Record<string, Team> = {
  mex: { id: "mex", name: "Mexico", flag: "🇲🇽" },
  rsa: { id: "rsa", name: "South Africa", flag: "🇿🇦" },
  kor: { id: "kor", name: "South Korea", flag: "🇰🇷" },
  "eur-d": { id: "eur-d", name: "Euro Playoff D", flag: "🏆" },
  can: { id: "can", name: "Canada", flag: "🇨🇦" },
  "eur-a": { id: "eur-a", name: "Euro Playoff A", flag: "🏆" },
  qat: { id: "qat", name: "Qatar", flag: "🇶🇦" },
  sui: { id: "sui", name: "Switzerland", flag: "🇨🇭" },
  bra: { id: "bra", name: "Brazil", flag: "🇧🇷" },
  mar: { id: "mar", name: "Morocco", flag: "🇲🇦" },
  hai: { id: "hai", name: "Haiti", flag: "🇭🇹" },
  sco: { id: "sco", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  usa: { id: "usa", name: "United States", flag: "🇺🇸" },
  par: { id: "par", name: "Paraguay", flag: "🇵🇾" },
  aus: { id: "aus", name: "Australia", flag: "🇦🇺" },
  "eur-c": { id: "eur-c", name: "Euro Playoff C", flag: "🏆" },
  ger: { id: "ger", name: "Germany", flag: "🇩🇪" },
  cur: { id: "cur", name: "Curaçao", flag: "🇨🇼" },
  civ: { id: "civ", name: "Ivory Coast", flag: "🇨🇮" },
  ecu: { id: "ecu", name: "Ecuador", flag: "🇪🇨" },
  ned: { id: "ned", name: "Netherlands", flag: "🇳🇱" },
  jpn: { id: "jpn", name: "Japan", flag: "🇯🇵" },
  "eur-b": { id: "eur-b", name: "Euro Playoff B", flag: "🏆" },
  tun: { id: "tun", name: "Tunisia", flag: "🇹🇳" },
  bel: { id: "bel", name: "Belgium", flag: "🇧🇪" },
  egy: { id: "egy", name: "Egypt", flag: "🇪🇬" },
  irn: { id: "irn", name: "Iran", flag: "🇮🇷" },
  nzl: { id: "nzl", name: "New Zealand", flag: "🇳🇿" },
  esp: { id: "esp", name: "Spain", flag: "🇪🇸" },
  cpv: { id: "cpv", name: "Cape Verde", flag: "🇨🇻" },
  ksa: { id: "ksa", name: "Saudi Arabia", flag: "🇸🇦" },
  uru: { id: "uru", name: "Uruguay", flag: "🇺🇾" },
  fra: { id: "fra", name: "France", flag: "🇫🇷" },
  sen: { id: "sen", name: "Senegal", flag: "🇸🇳" },
  "playoff-2": { id: "playoff-2", name: "Playoff Slot 2", flag: "🏆" },
  nor: { id: "nor", name: "Norway", flag: "🇳🇴" },
  arg: { id: "arg", name: "Argentina", flag: "🇦🇷" },
  alg: { id: "alg", name: "Algeria", flag: "🇩🇿" },
  aut: { id: "aut", name: "Austria", flag: "🇦🇹" },
  jor: { id: "jor", name: "Jordan", flag: "🇯🇴" },
  por: { id: "por", name: "Portugal", flag: "🇵🇹" },
  "playoff-1": { id: "playoff-1", name: "Playoff Slot 1", flag: "🏆" },
  uzb: { id: "uzb", name: "Uzbekistan", flag: "🇺🇿" },
  col: { id: "col", name: "Colombia", flag: "🇨🇴" },
  eng: { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  cro: { id: "cro", name: "Croatia", flag: "🇭🇷" },
  gha: { id: "gha", name: "Ghana", flag: "🇬🇭" },
  pan: { id: "pan", name: "Panama", flag: "🇵🇦" },
};

const emojiToCodepoint = (emoji: string) =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

const getEmojiUrl = (emoji: string) =>
  `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

export default function ThirdsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [predictionsLocked, setPredictionsLocked] = useState(!arePredictionsOpen());
  
  const [thirdPlaceTeams, setThirdPlaceTeams] = useState<{ team: Team; groupId: string }[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  const canProceed = selectedTeams.size === 8;

  useEffect(() => {
    loadThirdPlaceTeams();
  }, []);

  const loadThirdPlaceTeams = async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      
      const groupPreds = data.predictions?.filter((p: { type: string; groupName?: string; teamOrder?: string[] }) => p.type === "GROUP") || [];
      const groupOrder: Record<string, string[]> = {};
      
      groupPreds.forEach((pred: { type: string; groupName?: string; teamOrder?: string[] }) => {
        if (pred.groupName && pred.teamOrder) {
          groupOrder[pred.groupName] = pred.teamOrder;
        }
      });
      
      const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
      const thirds: { team: Team; groupId: string }[] = [];
      
      groups.forEach(groupId => {
        const order = groupOrder[groupId] || [];
        if (order[2]) {
          const thirdTeam = allTeamsInGroups[order[2]];
          if (thirdTeam) {
            thirds.push({ team: thirdTeam, groupId });
          }
        }
      });
      
      setThirdPlaceTeams(thirds);
      
      const existingThirdsPred = data.predictions?.find((p: { type: string; groupName?: string; teamOrder?: string[] }) => p.type === "THIRDS");
      if (existingThirdsPred?.teamOrder) {
        const validThirds = new Set(thirds.map(t => t.team.id));
        const validSelections = existingThirdsPred.teamOrder.filter((id: string) => validThirds.has(id));
        setSelectedTeams(new Set(validSelections));
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else if (newSet.size < 8) {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!canProceed || isSaving) return;
    
    setIsSaving(true);
    try {
      const prediction = {
        type: "THIRDS",
        groupName: null,
        knockoutRound: null,
        teamOrder: Array.from(selectedTeams)
      };

      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: [prediction] }),
      });

      if (response.ok) {
        router.push("/summary");
      }
    } catch (error) {
      console.error("Error saving predictions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2B3FE8]/10 via-transparent to-[#E8152A]/10" />
      </div>

      <div className="wc-container relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/groups")}
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-body"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Groups
          </button>
          <span className="text-xs tracking-[0.4em] uppercase text-gray-500">Third Place Picks</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-h2 text-white mb-4">
            Select Best 8 Third-Placed Teams
          </h1>
          <p className="text-body-large text-gray-400 max-w-2xl mx-auto">
            Choose the 8 teams you think will finish in 3rd place in their groups and qualify for the Round of 32.
          </p>
        </motion.div>

        <div className="mb-6">
          <CountdownTimer
            targetDate={PREDICTION_DEADLINE}
            onLockChange={setPredictionsLocked}
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
              selectedTeams.size >= 8 ? "bg-green-500 text-white" : "bg-white/10 text-gray-400"
            }`}>
              {selectedTeams.size}
            </div>
            <span className="text-gray-400">/ 8 teams selected</span>
          </div>
          
          {thirdPlaceTeams.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {thirdPlaceTeams.map(({ team, groupId }) => {
                const isSelected = selectedTeams.has(team.id);
                return (
                  <motion.button
                    key={`${groupId}-${team.id}`}
                    whileHover={predictionsLocked ? {} : { scale: 1.02 }}
                    whileTap={predictionsLocked ? {} : { scale: 0.98 }}
                    onClick={() => !predictionsLocked && toggleTeam(team.id)}
                    disabled={predictionsLocked || (!isSelected && selectedTeams.size >= 8)}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border transition-all
                      ${isSelected 
                        ? "bg-[#2B3FE8]/20 border-[#2B3FE8] shadow-[0_0_12px_rgba(43,63,232,0.3)]" 
                        : predictionsLocked || selectedTeams.size >= 8
                          ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                      }
                    `}
                  >
                    <img
                      src={getEmojiUrl(team.flag)}
                      alt={team.name}
                      className="w-6 h-4 rounded-sm object-cover"
                    />
                    <div className="flex flex-col items-start">
                      <span className={`text-sm ${isSelected ? "text-white font-semibold" : "text-gray-300"}`}>
                        {team.name}
                      </span>
                      <span className="text-xs text-gray-500">Group {groupId}</span>
                    </div>
                    {isSelected && (
                      <svg className="ml-auto w-5 h-5 text-[#2B3FE8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {thirdPlaceTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-body">
              No third place teams found. Please complete group stage predictions first.
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 mt-8"
        >
          {predictionsLocked ? (
            <div className="wc-btn-disabled px-16 cursor-not-allowed">
              Predictions Locked
            </div>
          ) : (
            <motion.button
              whileHover={canProceed && !isSaving ? { scale: 1.05 } : {}}
              whileTap={canProceed && !isSaving ? { scale: 0.95 } : {}}
              onClick={handleSave}
              disabled={!canProceed || isSaving}
              className={`wc-btn-primary px-16 ${!canProceed || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Continue'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
