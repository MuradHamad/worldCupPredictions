"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-page flex">
      {/* Left Side - Trophy Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1b2138] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b2138] via-[#141B4D] to-[#0B0F2B]" />
          <div className="absolute -left-24 top-0 h-full w-40 bg-gradient-to-b from-[#2B3FE8] via-[#2B3FE8]/30 to-transparent opacity-70" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-[#E8152A]/20 blur-[120px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Trophy Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-12"
            >
              <img
                src="/worldCupTrophy.webp"
                alt="Tournament Trophy"
                className="w-64 h-auto mx-auto drop-shadow-2xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="font-display text-h1 text-foreground mb-4">
                GLOBAL CUP
              </h1>
              <div className="font-display text-[120px] leading-none wc-text-gradient mb-6">
                2026
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-body-large text-gray-400 tracking-[0.3em] uppercase"
            >
              USA • Canada • Mexico
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 bg-page relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2B3FE8]/20 via-transparent to-[#E8152A]/10" />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            {/* Logo for mobile */}
            <div className="lg:hidden flex justify-center mb-12">
              <div className="text-center">
                <div className="font-display text-h3 text-foreground mb-2">GLOBAL CUP</div>
                <div className="font-display text-[80px] leading-none wc-text-gradient">2026</div>
              </div>
            </div>
            
            {/* Glass Card */}
            <div className="wc-glass rounded-[32px] p-10 md:p-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="font-display text-h3 text-foreground text-center mb-4">
                  Welcome
                </h2>
                <div className="wc-accent-line mx-auto w-32 mb-6" />
                <p className="text-body-large text-gray-400 text-center mb-10">
                  Sign in to make your predictions
                </p>
              </motion.div>

              {/* Google Sign In Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("google", { callbackUrl: "/rooms" })}
                className="w-full flex items-center justify-center gap-4 bg-white text-gray-900 rounded-2xl px-6 py-5 font-display text-xl hover:bg-gray-100 transition-all duration-300"
              >
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="relative my-10"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-card"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 bg-page text-gray-500 text-lg">or</span>
                </div>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-input border border-card">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8152A] to-[#F0465A] flex items-center justify-center flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground">Create or Join Rooms</h3>
                    <p className="text-gray-400 text-lg">Compete with friends & family</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-input border border-card">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B3FE8] to-[#2535C7] flex items-center justify-center flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground">Make Predictions</h3>
                    <p className="text-gray-400 text-lg">Group stage & knockouts</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-input border border-card">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5E642] to-[#F0D93A] flex items-center justify-center flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground">Climb the Leaderboard</h3>
                    <p className="text-gray-400 text-lg">Earn points & win</p>
                  </div>
                </div>
              </motion.div>

              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-10 pt-8 border-t border-white/10 text-center"
              >
                <p className="text-gray-500 text-base">
                  © 2026 Almanahel Company. All rights reserved.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
