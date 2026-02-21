"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdRoom, setCreatedRoom] = useState<{ name: string; code: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      setCreatedRoom(data.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.code);
    }
  };

  if (createdRoom) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#2B3FE8]/12 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#E8152A]/12 rounded-full blur-[150px]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="wc-glass rounded-[32px] p-10 md:p-14 w-full max-w-lg text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-[#2B3FE8] to-[#2535C7] rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          <h2 className="font-display text-h3 text-white mb-4">Room Created!</h2>
          <p className="text-body-large text-gray-400 mb-10">Share this code with your friends</p>

          <div className="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10">
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Room Name</p>
            <p className="font-display text-2xl text-white mb-6">{createdRoom.name}</p>
            
            <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Room Code</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-display text-5xl wc-text-gradient tracking-widest">
                {createdRoom.code}
              </span>
              <button
                onClick={copyCode}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="Copy code"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="wc-btn-primary w-full"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#2B3FE8]/12 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#F5E642]/10 rounded-full blur-[150px]" />
        </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="wc-glass rounded-[32px] p-10 md:p-14 w-full max-w-lg relative z-10"
      >
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-body-large"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-current">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <h1 className="font-display text-h2 text-white mb-4">Create Room</h1>
        <p className="text-body-large text-gray-400 mb-10">Give your room a name to get started</p>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-body-large font-medium text-gray-300 mb-3">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Friends League"
              className="wc-input w-full"
              minLength={3}
              maxLength={50}
              required
            />
            <p className="mt-3 text-gray-500 text-right text-body">
              {roomName.length}/50
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || roomName.length < 3}
            className="wc-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating...
              </>
            ) : (
              "Create Room"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
