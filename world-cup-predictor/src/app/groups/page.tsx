"use client";

import { useState } from "react";
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

export default function GroupsPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Record<string, string[]>>({});
  const [draggedItem, setDraggedItem] = useState<{ groupId: string; index: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emojiToCodepoint = (emoji: string) =>
    Array.from(emoji)
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join("-");

  const getEmojiUrl = (emoji: string) =>
    `https://twemoji.maxcdn.com/v/latest/72x72/${emojiToCodepoint(emoji)}.png`;

  const reorderTeams = (groupId: string, fromIndex: number, toIndex: number) => {
    const currentOrder = predictions[groupId] || groups.find(g => g.id === groupId)!.teams.map(t => t.id);
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setPredictions(prev => ({
      ...prev,
      [groupId]: newOrder,
    }));
  };

  const handlePointerDown = (groupId: string, index: number, e: React.PointerEvent) => {
    setDraggedItem({ groupId, index });
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !draggedItem) return;
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!target) return;
    const item = target.closest("[data-group-id]") as HTMLElement | null;
    if (!item) return;
    const groupId = item.dataset.groupId;
    const index = item.dataset.index ? Number(item.dataset.index) : null;
    if (!groupId || index === null) return;
    if (draggedItem.groupId !== groupId || draggedItem.index === index) return;
    reorderTeams(groupId, draggedItem.index, index);
    setDraggedItem({ groupId, index });
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    if (e?.currentTarget && e.pointerId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictions: Object.entries(predictions).map(([groupId, teamOrder]) => ({
            type: "GROUP",
            groupName: groupId,
            teamOrder,
          })),
        }),
      });

      if (response.ok) {
        router.push("/summary");
      }
    } catch (error) {
      console.error("Error saving predictions:", error);
    }
  };

  const getOrderedTeams = (group: Group) => {
    const order = predictions[group.id];
    if (!order) return group.teams;
    return order.map(id => group.teams.find(t => t.id === id)!).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-page py-12">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2B3FE8]/10 via-transparent to-[#E8152A]/10" />
      </div>

      <div className="wc-container relative z-10">
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
          <span className="text-xs tracking-[0.4em] uppercase text-gray-500">Group Stage</span>
        </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-h2 text-white mb-4">
            Group Stage Predictions
          </h1>
          <p className="text-body-large text-gray-400 max-w-2xl mx-auto">
            Drag and drop teams to arrange them in your predicted finishing order. 
            Top 2 teams from each group will advance.
          </p>
        </motion.div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {groups.map((group, groupIndex) => (
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
                <h2 className="font-display text-2xl text-white">{group.name}</h2>
              </div>

              {/* Teams List */}
              <div className="space-y-3">
                {getOrderedTeams(group).map((team, index) => (
                  <motion.div
                    key={team.id}
                    data-group-id={group.id}
                    data-index={index}
                    onPointerDown={(e) => handlePointerDown(group.id, index, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-move hover:bg-white/10 hover:border-white/20 transition-all touch-none select-none ${isDragging ? "cursor-grabbing" : ""}`}
                  >
                    <span className="font-display text-xl text-gray-500 w-8">
                      {index + 1}
                    </span>
                    <img
                      src={getEmojiUrl(team.flag)}
                      alt={`${team.name} flag`}
                      className="w-7 h-5 rounded-sm object-cover shadow"
                      loading="lazy"
                    />
                    <span className="text-body-large text-white flex-1">{team.name}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                      <path d="M8 6h12M4 12h16M8 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Done Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="wc-btn-primary px-16"
          >
            Done
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
