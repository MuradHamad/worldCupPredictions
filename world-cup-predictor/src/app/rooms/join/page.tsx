"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setRoomCode(value);
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2B3FE8]/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F5E642]/12 rounded-full blur-[160px]" />
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

        <h1 className="font-display text-h2 text-white mb-4">Join Room</h1>
        <p className="text-body-large text-gray-400 mb-10">Enter the room code shared by your friend</p>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-body-large font-medium text-gray-300 mb-3">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={handleCodeChange}
              placeholder="A3F9B2"
              className="wc-input w-full text-center text-4xl font-display tracking-[0.3em] uppercase py-6"
              maxLength={6}
              required
            />
            <p className="mt-4 text-gray-500 text-center text-body">
              Ask your friend for their 6-digit code
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || roomCode.length !== 6}
            className="wc-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Joining...
              </>
            ) : (
              "Join Room"
            )}
          </button>
        </form>

        {/* Example Code Display */}
        <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-body text-gray-400 text-center">
            Room codes look like: <span className="font-display text-2xl wc-text-gradient ml-2">A3F9B2</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
