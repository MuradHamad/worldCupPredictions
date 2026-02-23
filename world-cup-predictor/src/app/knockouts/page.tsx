"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  name: string;
  flag: string;
}

interface Match {
  id: string;
  round: string;
  team1: Team | null;
  team2: Team | null;
  winner: string | null;
}

interface Prediction {
  id: string;
  type: string;
  groupName: string | null;
  knockoutRound: string | null;
  teamOrder: string[];
  createdAt: string;
}

// Round of 32 - 16 matches
const roundOf32: Match[] = [
  { id: "r32-1", round: "r32", team1: { id: "mex", name: "Mexico", flag: "🇲🇽" }, team2: { id: "can", name: "Canada", flag: "🇨🇦" }, winner: null },
  { id: "r32-2", round: "r32", team1: { id: "bra", name: "Brazil", flag: "🇧🇷" }, team2: { id: "ger", name: "Germany", flag: "🇩🇪" }, winner: null },
  { id: "r32-3", round: "r32", team1: { id: "esp", name: "Spain", flag: "🇪🇸" }, team2: { id: "fra", name: "France", flag: "🇫🇷" }, winner: null },
  { id: "r32-4", round: "r32", team1: { id: "arg", name: "Argentina", flag: "🇦🇷" }, team2: { id: "por", name: "Portugal", flag: "🇵🇹" }, winner: null },
  { id: "r32-5", round: "r32", team1: { id: "ned", name: "Netherlands", flag: "🇳🇱" }, team2: { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, winner: null },
  { id: "r32-6", round: "r32", team1: { id: "bel", name: "Belgium", flag: "🇧🇪" }, team2: { id: "ita", name: "Italy", flag: "🇮🇹" }, winner: null },
  { id: "r32-7", round: "r32", team1: { id: "cro", name: "Croatia", flag: "🇭🇷" }, team2: { id: "uru", name: "Uruguay", flag: "🇺🇾" }, winner: null },
  { id: "r32-8", round: "r32", team1: { id: "usa", name: "USA", flag: "🇺🇸" }, team2: { id: "col", name: "Colombia", flag: "🇨🇴" }, winner: null },
  { id: "r32-9", round: "r32", team1: { id: "jpn", name: "Japan", flag: "🇯🇵" }, team2: { id: "kor", name: "South Korea", flag: "🇰🇷" }, winner: null },
  { id: "r32-10", round: "r32", team1: { id: "aus", name: "Australia", flag: "🇦🇺" }, team2: { id: "sui", name: "Switzerland", flag: "🇨🇭" }, winner: null },
  { id: "r32-11", round: "r32", team1: { id: "mar", name: "Morocco", flag: "🇲🇦" }, team2: { id: "egy", name: "Egypt", flag: "🇪🇬" }, winner: null },
  { id: "r32-12", round: "r32", team1: { id: "sen", name: "Senegal", flag: "🇸🇳" }, team2: { id: "tun", name: "Tunisia", flag: "🇹🇳" }, winner: null },
  { id: "r32-13", round: "r32", team1: { id: "qat", name: "Qatar", flag: "🇶🇦" }, team2: { id: "ecu", name: "Ecuador", flag: "🇪🇨" }, winner: null },
  { id: "r32-14", round: "r32", team1: { id: "rsa", name: "South Africa", flag: "🇿🇦" }, team2: { id: "nir", name: "Northern Ireland", flag: "🇳🇫" }, winner: null },
  { id: "r32-15", round: "r32", team1: { id: "irn", name: "Iran", flag: "🇮🇷" }, team2: { id: "ksa", name: "Saudi Arabia", flag: "🇸🇦" }, winner: null },
  { id: "r32-16", round: "r32", team1: { id: "can", name: "Canada", flag: "🇨🇦" }, team2: { id: "mex", name: "Mexico", flag: "🇲🇽" }, winner: null },
];

// Round of 16 - 8 matches (positions correspond to R32 winners)
const roundOf16: Match[] = [
  { id: "r16-1", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-2", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-3", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-4", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-5", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-6", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-7", round: "r16", team1: null, team2: null, winner: null },
  { id: "r16-8", round: "r16", team1: null, team2: null, winner: null },
];

// Quarter-finals - 4 matches
const quarterFinals: Match[] = [
  { id: "qf-1", round: "qf", team1: null, team2: null, winner: null },
  { id: "qf-2", round: "qf", team1: null, team2: null, winner: null },
  { id: "qf-3", round: "qf", team1: null, team2: null, winner: null },
  { id: "qf-4", round: "qf", team1: null, team2: null, winner: null },
];

// Semi-finals - 2 matches
const semiFinals: Match[] = [
  { id: "sf-1", round: "sf", team1: null, team2: null, winner: null },
  { id: "sf-2", round: "sf", team1: null, team2: null, winner: null },
];

// Third place and Final
const thirdPlace: Match[] = [
  { id: "third", round: "third", team1: null, team2: null, winner: null },
];

const finalMatch: Match[] = [
  { id: "final", round: "final", team1: null, team2: null, winner: null },
];

const emojiToCodepoint = (emoji: string) =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

const getEmojiUrl = (emoji: string) =>
  `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

export default function KnockoutsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Bracket state - store winners for each match
  const [selections, setSelections] = useState<Record<string, string>>({});
  
  // Computed bracket - auto-advance winners
  const getBracket = useCallback(() => {
    // Round of 32
    const r32 = roundOf32.map(m => ({
      ...m,
      winner: selections[m.id] || null
    }));
    
    // Round of 16 - auto-advance from R32
    const r16 = roundOf16.map((_, idx) => {
      const match1Idx = idx * 2;
      const match2Idx = match1Idx + 1;
      const winner1 = selections[`r32-${match1Idx + 1}`];
      const winner2 = selections[`r32-${match2Idx + 1}`];
      
      const team1 = winner1 ? roundOf32.find(m => m.id === `r32-${match1Idx + 1}`)?.team1 : null;
      const team2 = winner2 ? roundOf32.find(m => m.id === `r32-${match2Idx + 1}`)?.team2 : null;
      
      // If winner was selected, get actual team
      const actualTeam1 = winner1 ? (roundOf32[match1Idx]?.team1?.id === winner1 ? roundOf32[match1Idx]?.team1 : roundOf32[match1Idx]?.team2) : null;
      const actualTeam2 = winner2 ? (roundOf32[match2Idx]?.team1?.id === winner2 ? roundOf32[match2Idx]?.team1 : roundOf32[match2Idx]?.team2) : null;
      
      return {
        ...roundOf16[idx],
        team1: actualTeam1 || (team1 ? { id: winner1 || "", ...team1 } : null),
        team2: actualTeam2 || (team2 ? { id: winner2 || "", ...team2 } : null),
        winner: selections[roundOf16[idx].id] || null
      };
    });
    
    // Quarter-finals - auto-advance from R16
    const qf = quarterFinals.map((_, idx) => {
      const match1Idx = idx * 2;
      const match2Idx = match1Idx + 1;
      const winner1 = selections[`r16-${match1Idx + 1}`];
      const winner2 = selections[`r16-${match2Idx + 1}`];
      
      // Find the actual team objects
      const r16Match1 = r16[match1Idx];
      const r16Match2 = r16[match2Idx];
      
      const team1 = winner1 && r16Match1 ? (r16Match1.team1?.id === winner1 ? r16Match1.team1 : r16Match1.team2) : null;
      const team2 = winner2 && r16Match2 ? (r16Match2.team1?.id === winner2 ? r16Match2.team1 : r16Match2.team2) : null;
      
      return {
        ...quarterFinals[idx],
        team1,
        team2,
        winner: selections[quarterFinals[idx].id] || null
      };
    });
    
    // Semi-finals - auto-advance from QF
    const sf = semiFinals.map((_, idx) => {
      const match1Idx = idx * 2;
      const match2Idx = match1Idx + 1;
      const winner1 = selections[`qf-${match1Idx + 1}`];
      const winner2 = selections[`qf-${match2Idx + 1}`];
      
      const qfMatch1 = qf[match1Idx];
      const qfMatch2 = qf[match2Idx];
      
      const team1 = winner1 && qfMatch1 ? (qfMatch1.team1?.id === winner1 ? qfMatch1.team1 : qfMatch1.team2) : null;
      const team2 = winner2 && qfMatch2 ? (qfMatch2.team1?.id === winner2 ? qfMatch2.team1 : qfMatch2.team2) : null;
      
      return {
        ...semiFinals[idx],
        team1,
        team2,
        winner: selections[semiFinals[idx].id] || null
      };
    });
    
    // Third place - from SF losers
    const third = [{
      ...thirdPlace[0],
      team1: sf[0]?.winner ? null : (sf[0]?.team2 || null),
      team2: sf[1]?.winner ? null : (sf[1]?.team2 || null),
      winner: selections["third"] || null
    }];
    
    // Final - auto-advance from SF
    const final = [{
      ...finalMatch[0],
      team1: sf[0]?.winner ? (sf[0].team1?.id === sf[0].winner ? sf[0].team1 : sf[0].team2) : null,
      team2: sf[1]?.winner ? (sf[1].team1?.id === sf[1].winner ? sf[1].team1 : sf[1].team2) : null,
      winner: selections["final"] || null
    }];
    
    return { r32, r16, qf, sf, third, final };
  }, [selections]);
  
  const bracket = getBracket();
  
  useEffect(() => {
    fetchPredictions();
  }, []);
  
  const fetchPredictions = async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      
      // Load existing knockout predictions
      const knockoutPreds = data.predictions?.filter((p: Prediction) => p.type === "KNOCKOUT") || [];
      const newSelections: Record<string, string> = {};
      
      knockoutPreds.forEach((pred: Prediction) => {
        if (pred.knockoutRound && pred.teamOrder && pred.teamOrder.length > 0) {
          newSelections[pred.knockoutRound] = pred.teamOrder[0];
        }
      });
      
      setSelections(newSelections);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectWinner = (matchId: string, round: string, team: Team) => {
    setSelections(prev => ({
      ...prev,
      [matchId]: team.id
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build predictions array from selections
      const predictionsToSave = Object.entries(selections).map(([matchId, winnerId]) => ({
        type: "KNOCKOUT",
        knockoutRound: matchId,
        teamOrder: [winnerId]
      }));
      
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: predictionsToSave }),
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
  
  const renderMatch = (match: Match) => {
    const isSelected1 = selections[match.id] === match.team1?.id;
    const isSelected2 = selections[match.id] === match.team2?.id;
    
    return (
      <div key={match.id} className="flex flex-col gap-1">
        {/* Team 1 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => match.team1 && handleSelectWinner(match.id, match.round, match.team1!)}
          disabled={!match.team1}
          className={`
            flex items-center gap-2 p-2 rounded-lg border transition-all min-h-[44px]
            ${!match.team1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
            ${isSelected1 
              ? "bg-[#2B3FE8]/20 border-[#2B3FE8] shadow-[0_0_12px_rgba(43,63,232,0.3)]" 
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
          `}
        >
          {match.team1 ? (
            <>
              <img
                src={getEmojiUrl(match.team1.flag)}
                alt={match.team1.name}
                className="w-5 h-4 rounded-sm object-cover"
              />
              <span className={`text-xs truncate ${isSelected1 ? "text-white font-semibold" : "text-gray-300"}`}>
                {match.team1.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500">TBD</span>
          )}
        </motion.button>
        
        {/* Team 2 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => match.team2 && handleSelectWinner(match.id, match.round, match.team2!)}
          disabled={!match.team2}
          className={`
            flex items-center gap-2 p-2 rounded-lg border transition-all min-h-[44px]
            ${!match.team2 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
            ${isSelected2 
              ? "bg-[#2B3FE8]/20 border-[#2B3FE8] shadow-[0_0_12px_rgba(43,63,232,0.3)]" 
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
          `}
        >
          {match.team2 ? (
            <>
              <img
                src={getEmojiUrl(match.team2.flag)}
                alt={match.team2.name}
                className="w-5 h-4 rounded-sm object-cover"
              />
              <span className={`text-xs truncate ${isSelected2 ? "text-white font-semibold" : "text-gray-300"}`}>
                {match.team2.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500">TBD</span>
          )}
        </motion.button>
      </div>
    );
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
    <div className="min-h-screen bg-page py-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2B3FE8]/10 via-transparent to-[#E8152A]/10" />
      </div>

      <div className="wc-container relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-body"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </button>
          <span className="text-xs tracking-[0.4em] uppercase text-gray-500">Knockout Stage</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 px-4"
        >
          <h1 className="font-display text-h3 text-white mb-3">
            Knockout Stage Predictions
          </h1>
          <p className="text-body text-gray-400 max-w-2xl mx-auto">
            Tap to select winners for each match. Winners automatically advance to the next round.
          </p>
        </motion.div>

        {/* Bracket Container - Horizontal Scroll */}
        <div className="overflow-x-auto pb-4 px-4">
          <div className="flex gap-3 min-w-max">
            
            {/* Round of 32 */}
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-2 tracking-wider">Round of 32</h3>
              <div className="flex flex-col gap-2">
                {bracket.r32.map((match, idx) => (
                  <div key={match.id} className="flex items-center gap-1">
                    <div className="w-28">
                      {renderMatch(match)}
                    </div>
                    {idx % 2 === 0 && (
                      <div className="w-4 h-[1px] bg-white/20"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connectors for R32 to R16 */}
            <div className="flex flex-col justify-around py-8">
              {Array(8).fill(0).map((_, idx) => (
                <div key={idx} className="h-8 flex items-center">
                  <div className="w-4 h-[1px] bg-white/20"></div>
                  <div className="w-[1px] h-16 bg-white/10"></div>
                </div>
              ))}
            </div>

            {/* Round of 16 */}
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-2 tracking-wider">Round of 16</h3>
              <div className="flex flex-col gap-8">
                {bracket.r16.map((match, idx) => (
                  <div key={match.id} className="flex items-center gap-1">
                    <div className="w-28">
                      {renderMatch(match)}
                    </div>
                    {idx % 2 === 0 && (
                      <div className="w-4 h-[1px] bg-white/20"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connectors for R16 to QF */}
            <div className="flex flex-col justify-around py-12">
              {Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="h-16 flex items-center">
                  <div className="w-4 h-[1px] bg-white/20"></div>
                  <div className="w-[1px] h-32 bg-white/10"></div>
                </div>
              ))}
            </div>

            {/* Quarter Finals */}
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-2 tracking-wider">Quarter Finals</h3>
              <div className="flex flex-col gap-16">
                {bracket.qf.map((match, idx) => (
                  <div key={match.id} className="flex items-center gap-1">
                    <div className="w-28">
                      {renderMatch(match)}
                    </div>
                    {idx % 2 === 0 && (
                      <div className="w-4 h-[1px] bg-white/20"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connectors for QF to SF */}
            <div className="flex flex-col justify-around py-16">
              {Array(2).fill(0).map((_, idx) => (
                <div key={idx} className="h-32 flex items-center">
                  <div className="w-4 h-[1px] bg-white/20"></div>
                  <div className="w-[1px] h-64 bg-white/10"></div>
                </div>
              ))}
            </div>

            {/* Semi Finals */}
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-2 tracking-wider">Semi Finals</h3>
              <div className="flex flex-col gap-32">
                {bracket.sf.map((match) => (
                  <div key={match.id} className="flex items-center gap-1">
                    <div className="w-28">
                      {renderMatch(match)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connectors for SF to Third/Final */}
            <div className="flex flex-col justify-around py-16">
              <div className="h-32 flex items-center">
                <div className="w-4 h-[1px] bg-white/20"></div>
                <div className="w-[1px] h-32 bg-white/10 -mt-16"></div>
              </div>
              <div className="h-32 flex items-center">
                <div className="w-4 h-[1px] bg-white/20"></div>
                <div className="w-[1px] h-32 bg-white/10"></div>
              </div>
            </div>

            {/* Third Place & Final */}
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-sm text-[#F5E642] text-center mb-2 tracking-wider">Third Place</h3>
              <div className="mb-8">
                {renderMatch(bracket.third[0])}
              </div>
              
              <h3 className="font-display text-sm text-[#F5E642] text-center mb-2 tracking-wider">Final</h3>
              <div className="w-28 bg-[#F5E642]/10 border border-[#F5E642]/30 rounded-xl p-2">
                {bracket.final[0].team1 && bracket.final[0].team2 ? (
                  <div className="flex flex-col gap-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectWinner("final", "final", bracket.final[0].team1!)}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg border transition-all
                        ${selections["final"] === bracket.final[0].team1?.id 
                          ? "bg-[#F5E642]/20 border-[#F5E642] shadow-[0_0_12px_rgba(245,230,66,0.3)]" 
                          : "bg-white/5 border-white/10 hover:bg-white/10"}
                      `}
                    >
                      <img src={getEmojiUrl(bracket.final[0].team1.flag)} alt="" className="w-5 h-4 rounded-sm" />
                      <span className="text-xs text-white">{bracket.final[0].team1.name}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectWinner("final", "final", bracket.final[0].team2!)}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg border transition-all
                        ${selections["final"] === bracket.final[0].team2?.id 
                          ? "bg-[#F5E642]/20 border-[#F5E642] shadow-[0_0_12px_rgba(245,230,66,0.3)]" 
                          : "bg-white/5 border-white/10 hover:bg-white/10"}
                      `}
                    >
                      <img src={getEmojiUrl(bracket.final[0].team2.flag)} alt="" className="w-5 h-4 rounded-sm" />
                      <span className="text-xs text-white">{bracket.final[0].team2.name}</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500">
                    Complete SF to see finalists
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Done Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8 px-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="wc-btn-primary px-16 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Done"}
          </motion.button>
        </motion.div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6 px-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#2B3FE8]/20 border border-[#2B3FE8]"></div>
            <span>Selected Winner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/5 border border-white/10"></div>
            <span>Tap to Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
