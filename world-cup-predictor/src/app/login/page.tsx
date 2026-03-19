"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-blue-600" />
        
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="4" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#stripes)" />
          </svg>
        </div>

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#fe1644" />
              <path d="M12 2L12 22M2 12L22 12" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </div>
          <div>
            <span className="font-display text-2xl text-white font-bold tracking-wide">GLOBAL CUP</span>
            <span className="font-display text-2xl text-white/80 font-bold ml-2">2026</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center w-full p-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <div className="w-72 h-72 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              <img
                src="/worldCupTrophy.webp"
                alt="Tournament Trophy"
                className="w-full h-auto drop-shadow-2xl relative z-10"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-1 bg-white/60 rounded-full" />
              <span className="font-display text-sm text-white/80 tracking-[0.4em] uppercase">USA • Canada • Mexico</span>
              <div className="w-16 h-1 bg-white/60 rounded-full" />
            </div>
            
            <h1 className="font-display text-7xl text-white mb-2 tracking-tight">
              THE GLOBAL CUP
            </h1>
            <p className="text-white/70 text-xl font-medium">
              Predict. Compete. Win.
            </p>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center justify-between text-white/60 text-sm">
            <span>48 Teams</span>
            <span>104 Matches</span>
            <span>1 Champion</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white relative flex items-center justify-center p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="white" />
                  <circle cx="12" cy="12" r="4" fill="#fe1644" />
                </svg>
              </div>
              <span className="font-display text-2xl text-gray-900 font-bold">GLOBAL CUP 2026</span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <div className="wc-accent-line mx-auto w-16 mb-4" />
            <p className="text-gray-500 text-lg">
              Sign in to make your predictions
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google", { callbackUrl: "/rooms" })}
            className="w-full flex items-center justify-center gap-4 bg-gray-900 text-white rounded-2xl px-6 py-5 font-display text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-gray-400 text-base font-medium">or</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg text-gray-900">Create or Join Rooms</h3>
                <p className="text-gray-500 text-base">Compete with friends & family</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg text-gray-900">Predict Scores</h3>
                <p className="text-gray-500 text-base">Groups, knockouts & finals</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg text-gray-900">Climb the Board</h3>
                <p className="text-gray-500 text-base">Earn points & top the leaderboard</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-10 pt-6 border-t border-gray-100 text-center"
          >
            <p className="text-gray-400 text-sm">
              © 2026 Al-Manahel Company. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
