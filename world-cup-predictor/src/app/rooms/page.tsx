"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RoomsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name?.split(" ")[0] || "Friend";

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2B3FE8]/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F5E642]/10 rounded-full blur-[160px]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="wc-glass rounded-[32px] p-12 md:p-16 w-full max-w-2xl relative z-10 text-center"
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-h2 text-white mb-4">
            Welcome, {userName}!
          </h1>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
            <p className="text-body-large text-gray-300">
              Choose how you want to play.
            </p>
        </motion.div>

        {/* Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
        >
          {/* Create Room Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/rooms/create")}
            className="wc-btn-secondary whitespace-nowrap"
          >
            Create a Room
          </motion.button>

          {/* Join Room Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/rooms/join")}
            className="wc-btn-primary whitespace-nowrap"
          >
            Join a Room
          </motion.button>
        </motion.div>

        {/* Play Without Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white text-body transition-colors underline underline-offset-4"
          >
            Play without rooms
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
