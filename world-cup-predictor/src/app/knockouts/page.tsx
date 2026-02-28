"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import CountdownTimer from "@/components/CountdownTimer";
import { PREDICTION_DEADLINE, arePredictionsOpen } from "@/lib/config";
import {
  resolveThirdPlaceBracket,
  type GroupLetter,
} from "@/lib/annexe-c";

interface Team {
  id: string;
  name: string;
  flag: string;
}

interface Match {
  id: string;
  round: string;
  team1: Team | null | undefined;
  team2: Team | null | undefined;
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

interface QualifiedTeam {
  team: Team;
  groupPosition: "1st" | "2nd" | "3rd";
  group: string;
}

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const R32_BRACKET: Record<number, { team1: string; team2: string }> = {
  1: { team1: "2A", team2: "2B" },
  2: { team1: "1E", team2: "3rd-ABCDF" },
  3: { team1: "1F", team2: "2C" },
  4: { team1: "1C", team2: "2F" },
  5: { team1: "1I", team2: "3rd-CDFGH" },
  6: { team1: "2E", team2: "2I" },
  7: { team1: "1A", team2: "3rd-CEFHI" },
  8: { team1: "1L", team2: "3rd-EHIJK" },
  9: { team1: "1D", team2: "3rd-BEFIJ" },
  10: { team1: "1G", team2: "3rd-AEHIJ" },
  11: { team1: "2K", team2: "2L" },
  12: { team1: "1H", team2: "2J" },
  13: { team1: "1B", team2: "3rd-EFGIJ" },
  14: { team1: "1J", team2: "2H" },
  15: { team1: "1K", team2: "3rd-DEIJL" },
  16: { team1: "2D", team2: "2G" },
};

const R16_BRACKET: Record<number, { match1: number; match2: number }> = {
  1: { match1: 2, match2: 5 },
  2: { match1: 1, match2: 3 },
  3: { match1: 4, match2: 6 },
  4: { match1: 7, match2: 8 },
  5: { match1: 11, match2: 12 },
  6: { match1: 9, match2: 10 },
  7: { match1: 14, match2: 16 },
  8: { match1: 13, match2: 15 },
};

const QF_BRACKET: Record<number, { match1: number; match2: number }> = {
  1: { match1: 1, match2: 2 },
  2: { match1: 5, match2: 6 },
  3: { match1: 3, match2: 4 },
  4: { match1: 7, match2: 8 },
};

const SF_BRACKET: Record<number, { match1: number; match2: number }> = {
  1: { match1: 1, match2: 2 },
  2: { match1: 3, match2: 4 },
};

const THIRD_POSITION_TO_MATCH: Record<string, number> = {
  "3rd-ABCDF": 2,
  "3rd-CDFGH": 5,
  "3rd-CEFHI": 7,
  "3rd-EHIJK": 8,
  "3rd-BEFIJ": 9,
  "3rd-AEHIJ": 10,
  "3rd-EFGIJ": 13,
  "3rd-DEIJL": 15,
};

function getTeamFromPosition(
  qualifiedTeams: QualifiedTeam[], 
  position: string,
  thirdPlaceMapping: Record<number, { team: Team; group: string } | null>
): Team | null {
  if (position.startsWith("3rd-")) {
    const matchNum = THIRD_POSITION_TO_MATCH[position];
    
    if (!matchNum) {
      return null;
    }
    
    const resolved = thirdPlaceMapping[matchNum];
    return resolved?.team || null;
  }
  
  const match = position.match(/^(\d)([A-L])$/);
  if (!match) return null;
  
  const pos = match[1] as "1" | "2";
  const group = match[2];
  const team = qualifiedTeams.find(t => t.group === group && t.groupPosition === (pos === "1" ? "1st" : "2nd"));
  return team?.team || null;
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

// Round of 32 - will be generated dynamically from qualifiedTeams in getBracket

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
  const [predictionsLocked, setPredictionsLocked] = useState(!arePredictionsOpen());
  
  // Bracket state - store winners for each match
  const [selections, setSelections] = useState<Record<string, string>>({});
  
  // Qualified teams from group stage with position info
  const [qualifiedTeams, setQualifiedTeams] = useState<QualifiedTeam[]>([]);
  
  // Computed third place mapping using Annexe C rules
  const thirdPlaceMapping = useMemo(() => {
    const groupResults = qualifiedTeams.map(qt => ({
      group: qt.group as GroupLetter,
      position: qt.groupPosition as '1st' | '2nd' | '3rd',
      team: qt.team,
    }));

    const userSelectedThirdIds = new Set(
      qualifiedTeams
        .filter(t => t.groupPosition === '3rd')
        .map(t => t.team.id)
    );

    const mapping = resolveThirdPlaceBracket(groupResults, userSelectedThirdIds);
    
    const result: Record<number, { team: Team; group: string } | null> = {};
    for (const [matchNum, thirdTeam] of Object.entries(mapping)) {
      result[parseInt(matchNum)] = thirdTeam 
        ? { team: thirdTeam.team, group: thirdTeam.group }
        : null;
    }
    return result;
  }, [qualifiedTeams]);

  // Computed bracket - auto-advance winners
  const getBracket = useCallback(() => {
    // Generate Round of 32 using FIFA bracket structure
    const r32Matches: Match[] = [];
    
    for (let i = 1; i <= 16; i++) {
      const bracketPos = R32_BRACKET[i];
      const team1 = getTeamFromPosition(qualifiedTeams, bracketPos.team1, thirdPlaceMapping);
      const team2 = getTeamFromPosition(qualifiedTeams, bracketPos.team2, thirdPlaceMapping);
      
      r32Matches.push({
        id: `r32-${i}`,
        round: "r32",
        team1,
        team2,
        winner: selections[`r32-${i}`] || null
      });
    }
    
    const r32 = r32Matches;
    
    // Round of 16 - FIFA bracket structure
    const r16 = roundOf16.map((_, idx) => {
      const r16Idx = idx + 1;
      const bracketPos = R16_BRACKET[r16Idx];
      const r32Match1 = r32[bracketPos.match1 - 1];
      const r32Match2 = r32[bracketPos.match2 - 1];
      
      const winner1 = selections[`r32-${bracketPos.match1}`];
      const winner2 = selections[`r32-${bracketPos.match2}`];
      
      let team1: Team | null = null;
      let team2: Team | null = null;
      
      if (winner1 && r32Match1) {
        team1 = r32Match1.team1?.id === winner1 ? r32Match1.team1 : 
                r32Match1.team2?.id === winner1 ? r32Match1.team2 : null;
      }
      
      if (winner2 && r32Match2) {
        team2 = r32Match2.team1?.id === winner2 ? r32Match2.team1 : 
                r32Match2.team2?.id === winner2 ? r32Match2.team2 : null;
      }
      
      return {
        ...roundOf16[idx],
        team1,
        team2,
        winner: selections[`r16-${r16Idx}`] || null
      };
    });
    
    // Quarter-finals - FIFA bracket structure
    const qf = quarterFinals.map((_, idx) => {
      const qfIdx = idx + 1;
      const bracketPos = QF_BRACKET[qfIdx];
      const r16Match1 = r16[bracketPos.match1 - 1];
      const r16Match2 = r16[bracketPos.match2 - 1];
      
      const winner1 = selections[`r16-${bracketPos.match1}`];
      const winner2 = selections[`r16-${bracketPos.match2}`];
      
      const team1 = winner1 && r16Match1 ? (r16Match1.team1?.id === winner1 ? r16Match1.team1 : r16Match1.team2) ?? null : null;
      const team2 = winner2 && r16Match2 ? (r16Match2.team1?.id === winner2 ? r16Match2.team1 : r16Match2.team2) ?? null : null;
      
      return {
        ...quarterFinals[idx],
        team1,
        team2,
        winner: selections[`qf-${qfIdx}`] || null
      };
    });
    
    // Semi-finals - FIFA bracket structure
    const sf = semiFinals.map((_, idx) => {
      const sfIdx = idx + 1;
      const bracketPos = SF_BRACKET[sfIdx];
      const qfMatch1 = qf[bracketPos.match1 - 1];
      const qfMatch2 = qf[bracketPos.match2 - 1];
      
      const winner1 = selections[`qf-${bracketPos.match1}`];
      const winner2 = selections[`qf-${bracketPos.match2}`];
      
      const team1 = winner1 && qfMatch1 ? (qfMatch1.team1?.id === winner1 ? qfMatch1.team1 : qfMatch1.team2) ?? null : null;
      const team2 = winner2 && qfMatch2 ? (qfMatch2.team1?.id === winner2 ? qfMatch2.team1 : qfMatch2.team2) ?? null : null;
      
      return {
        ...semiFinals[idx],
        team1,
        team2,
        winner: selections[`sf-${sfIdx}`] || null
      };
    });
    
    // Third place - SF losers
    const sf1Loser = sf[0]?.winner ? 
      (sf[0].team1?.id === sf[0].winner ? sf[0].team2 : sf[0].team1) ?? null : null;
    const sf2Loser = sf[1]?.winner ? 
      (sf[1].team1?.id === sf[1].winner ? sf[1].team2 : sf[1].team1) ?? null : null;
    
    const third: Match[] = [{
      ...thirdPlace[0],
      team1: sf1Loser,
      team2: sf2Loser,
      winner: selections["third"] || null
    }];
    
    // Final - SF winners
    const sf1Winner = sf[0]?.winner ? 
      (sf[0].team1?.id === sf[0].winner ? sf[0].team1 : sf[0].team2) ?? null : null;
    const sf2Winner = sf[1]?.winner ? 
      (sf[1].team1?.id === sf[1].winner ? sf[1].team1 : sf[1].team2) ?? null : null;
    
    const final: Match[] = [{
      ...finalMatch[0],
      team1: sf1Winner,
      team2: sf2Winner,
      winner: selections["final"] || null
    }];
    
    return { r32, r16, qf, sf, third, final };
  }, [selections, qualifiedTeams, thirdPlaceMapping]);
  
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
      
      // Load GROUP predictions and extract qualified teams with position info
      const groupPreds = data.predictions?.filter((p: Prediction) => p.type === "GROUP") || [];
      const groupOrder: Record<string, string[]> = {};
      
      groupPreds.forEach((pred: Prediction) => {
        if (pred.groupName && pred.teamOrder) {
          groupOrder[pred.groupName] = pred.teamOrder;
        }
      });
      
      // Get teams with their group positions (1st, 2nd from each group)
      const qualified: QualifiedTeam[] = [];
      const addedTeamIds = new Set<string>();
      
      GROUPS.forEach(groupId => {
        const order = groupOrder[groupId] || [];
        
        const first = order[0] ? allTeamsInGroups[order[0]] : null;
        const second = order[1] ? allTeamsInGroups[order[1]] : null;
        
        if (first && !addedTeamIds.has(first.id)) {
          qualified.push({ team: first, groupPosition: "1st", group: groupId });
          addedTeamIds.add(first.id);
        }
        if (second && !addedTeamIds.has(second.id)) {
          qualified.push({ team: second, groupPosition: "2nd", group: groupId });
          addedTeamIds.add(second.id);
        }
      });
      
      // Get third-placed teams that user selected to advance (from THIRDS prediction)
      const thirdsPred = data.predictions?.find((p: Prediction) => p.type === "THIRDS");
      const userSelectedThirdIds = new Set(thirdsPred?.teamOrder || []);
      
      // Find 3rd place teams from each group that were selected by user
      GROUPS.forEach(groupId => {
        const order = groupOrder[groupId] || [];
        const third = order[2] ? allTeamsInGroups[order[2]] : null;
        
        if (third && userSelectedThirdIds.has(third.id) && !addedTeamIds.has(third.id)) {
          qualified.push({ team: third, groupPosition: "3rd", group: groupId });
          addedTeamIds.add(third.id);
        }
      });
      
      setQualifiedTeams(qualified);
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
  
  const renderMatch = (match: Match, compact = false) => {
    const isSelected1 = selections[match.id] === match.team1?.id;
    const isSelected2 = selections[match.id] === match.team2?.id;
    
    return (
      <div className={`flex ${compact ? 'flex-row items-center gap-1' : 'flex-col gap-2'}`}>
        {/* Team 1 */}
        <motion.button
          whileHover={predictionsLocked ? {} : { scale: 1.02 }}
          whileTap={predictionsLocked ? {} : { scale: 0.98 }}
          onClick={() => !predictionsLocked && match.team1 && handleSelectWinner(match.id, match.round, match.team1!)}
          disabled={!match.team1 || predictionsLocked}
          className={`
            flex items-center gap-2 p-2 rounded-lg border transition-all min-h-[40px] w-full
            ${!match.team1 || predictionsLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
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
                className="w-5 h-4 rounded-sm object-cover flex-shrink-0"
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
          whileHover={predictionsLocked ? {} : { scale: 1.02 }}
          whileTap={predictionsLocked ? {} : { scale: 0.98 }}
          onClick={() => !predictionsLocked && match.team2 && handleSelectWinner(match.id, match.round, match.team2!)}
          disabled={!match.team2 || predictionsLocked}
          className={`
            flex items-center gap-2 p-2 rounded-lg border transition-all min-h-[40px] w-full
            ${!match.team2 || predictionsLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
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
                className="w-5 h-4 rounded-sm object-cover flex-shrink-0"
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

        {/* Countdown Timer */}
        <div className="mb-8 px-4">
          <CountdownTimer
            targetDate={PREDICTION_DEADLINE}
            onLockChange={setPredictionsLocked}
          />
        </div>

        {/* Bracket Container - Grid Layout with Better Separation */}
        <div className="px-4 space-y-8">
          {/* Round of 32 */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-4 tracking-wider uppercase">Round of 32</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bracket.r32.map((match) => (
                <div key={match.id} className="bg-black/20 rounded-xl p-2 border border-white/5">
                  {renderMatch(match, true)}
                </div>
              ))}
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <div className="h-8 w-[2px] bg-gradient-to-b from-[#2B3FE8]/50 to-[#2B3FE8]/20"></div>
          </div>

          {/* Round of 16 */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-4 tracking-wider uppercase">Round of 16</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bracket.r16.map((match) => (
                <div key={match.id} className="bg-black/30 rounded-xl p-3 border border-white/10 shadow-lg">
                  {renderMatch(match, true)}
                </div>
              ))}
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <div className="h-12 w-[2px] bg-gradient-to-b from-[#2B3FE8]/50 to-[#2B3FE8]/20"></div>
          </div>

          {/* Quarter Finals */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-4 tracking-wider uppercase">Quarter Finals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bracket.qf.map((match) => (
                <div key={match.id} className="bg-black/30 rounded-xl p-4 border border-white/10 shadow-lg">
                  {renderMatch(match)}
                </div>
              ))}
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <div className="h-16 w-[2px] bg-gradient-to-b from-[#2B3FE8]/50 to-[#2B3FE8]/20"></div>
          </div>

          {/* Semi Finals */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="font-display text-sm text-[#2B3FE8] text-center mb-4 tracking-wider uppercase">Semi Finals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {bracket.sf.map((match) => (
                <div key={match.id} className="bg-black/40 rounded-xl p-4 border border-[#2B3FE8]/30 shadow-lg shadow-[#2B3FE8]/10">
                  {renderMatch(match)}
                </div>
              ))}
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <div className="h-20 w-[2px] bg-gradient-to-b from-[#F5E642]/50 to-[#F5E642]/20"></div>
          </div>

          {/* Third Place & Final */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Third Place */}
            <div className="bg-white/5 rounded-2xl p-4 border border-[#F5E642]/20">
              <h3 className="font-display text-sm text-[#F5E642] text-center mb-4 tracking-wider uppercase">Third Place</h3>
              <div className="bg-black/30 rounded-xl p-4 border border-[#F5E642]/20">
                {renderMatch(bracket.third[0])}
              </div>
            </div>

            {/* Final */}
            <div className="bg-white/5 rounded-2xl p-4 border border-[#F5E642]/30">
              <h3 className="font-display text-sm text-[#F5E642] text-center mb-4 tracking-wider uppercase">Final</h3>
              <div className="bg-black/40 rounded-xl p-4 border border-[#F5E642]/30 shadow-lg shadow-[#F5E642]/10">
                {bracket.final[0].team1 && bracket.final[0].team2 ? (
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileHover={predictionsLocked ? {} : { scale: 1.02 }}
                      whileTap={predictionsLocked ? {} : { scale: 0.98 }}
                      onClick={() => !predictionsLocked && handleSelectWinner("final", "final", bracket.final[0].team1!)}
                      disabled={predictionsLocked}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border transition-all
                        ${!bracket.final[0].team1 || predictionsLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                        ${selections["final"] === bracket.final[0].team1?.id 
                          ? "bg-[#F5E642]/20 border-[#F5E642] shadow-[0_0_12px_rgba(245,230,66,0.3)]" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
                      `}
                    >
                      <img src={getEmojiUrl(bracket.final[0].team1.flag)} alt="" className="w-6 h-5 rounded-sm" />
                      <span className={`text-sm ${selections["final"] === bracket.final[0].team1?.id ? "text-white font-semibold" : "text-gray-300"}`}>
                        {bracket.final[0].team1.name}
                      </span>
                    </motion.button>
                    <div className="text-center py-1 text-xs text-gray-600">vs</div>
                    <motion.button
                      whileHover={predictionsLocked ? {} : { scale: 1.02 }}
                      whileTap={predictionsLocked ? {} : { scale: 0.98 }}
                      onClick={() => !predictionsLocked && handleSelectWinner("final", "final", bracket.final[0].team2!)}
                      disabled={predictionsLocked}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border transition-all
                        ${!bracket.final[0].team2 || predictionsLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                        ${selections["final"] === bracket.final[0].team2?.id 
                          ? "bg-[#F5E642]/20 border-[#F5E642] shadow-[0_0_12px_rgba(245,230,66,0.3)]" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
                      `}
                    >
                      <img src={getEmojiUrl(bracket.final[0].team2.flag)} alt="" className="w-6 h-5 rounded-sm" />
                      <span className={`text-sm ${selections["final"] === bracket.final[0].team2?.id ? "text-white font-semibold" : "text-gray-300"}`}>
                        {bracket.final[0].team2.name}
                      </span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">
                    Complete Semi Finals<br/>to see finalists
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
