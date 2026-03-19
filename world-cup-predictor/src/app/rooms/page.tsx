"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RoomsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name?.split(" ")[0] || "Friend";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-50 via-white to-blue-50" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-600">Ready to play</span>
          </div>
          <h1 className="font-display text-5xl text-gray-900 mb-3">
            Hey, {userName}!
          </h1>
          <p className="text-gray-500 text-xl">
            How do you want to play today?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/rooms/create")}
            className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-red-300 shadow-md hover:shadow-xl transition-all duration-200 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-red-100 transition-colors" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h2 className="font-display text-3xl text-gray-900 mb-2">Create Room</h2>
              <p className="text-gray-500 text-lg mb-4">Start a new prediction room</p>
              
              <div className="flex items-center gap-2 text-red-500 font-medium">
                <span>Create now</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/rooms/join")}
            className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-200 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h2 className="font-display text-3xl text-gray-900 mb-2">Join Room</h2>
              <p className="text-gray-500 text-lg mb-4">Enter a room code to play</p>
              
              <div className="flex items-center gap-2 text-blue-500 font-medium">
                <span>Join now</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-600 text-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Play without rooms
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
