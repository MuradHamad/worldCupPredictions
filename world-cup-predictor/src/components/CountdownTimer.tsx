"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  targetDate: string | Date;
  title?: string;
  showLockMessage?: boolean;
  onLockChange?: (isLocked: boolean) => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(targetDate: string | Date): TimeRemaining {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: difference };
}

export default function CountdownTimer({
  targetDate,
  title = "Predictions Close In",
  showLockMessage = true,
  onLockChange,
  className = "",
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate)
  );
  const [isLocked, setIsLocked] = useState(() => calculateTimeRemaining(targetDate).total <= 0);

  const updateTimer = useCallback(() => {
    const newTimeRemaining = calculateTimeRemaining(targetDate);
    setTimeRemaining(newTimeRemaining);

    const shouldBeLocked = newTimeRemaining.total <= 0;
    if (shouldBeLocked !== isLocked) {
      setIsLocked(shouldBeLocked);
      onLockChange?.(shouldBeLocked);
    }
  }, [targetDate, isLocked, onLockChange]);

  useEffect(() => {
    // Notify parent on mount if locked
    if (isLocked) {
      onLockChange?.(true);
    }
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [updateTimer, isLocked, onLockChange]);

  // If predictions are locked
  if (isLocked || timeRemaining.total <= 0) {
    if (!showLockMessage) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-[#E8152A]/20 border border-[#E8152A]/30 rounded-2xl p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8152A]/30 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8152A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <p className="font-display text-lg text-[#E8152A]">Predictions Locked</p>
            <p className="text-white/60 text-sm">
              Tournament has started. No more changes allowed.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${className}`}>
      {title && (
        <p className="text-white/60 text-sm font-display mb-3 uppercase tracking-wider">
          {title}
        </p>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Days */}
        <TimeBlock value={timeRemaining.days} label="Days" />
        <Separator />
        {/* Hours */}
        <TimeBlock value={timeRemaining.hours} label="Hrs" />
        <Separator />
        {/* Minutes */}
        <TimeBlock value={timeRemaining.minutes} label="Min" />
        <Separator />
        {/* Seconds */}
        <TimeBlock value={timeRemaining.seconds} label="Sec" />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const displayValue = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-br from-[#2B3FE8] to-[#2535C7] rounded-xl px-2 sm:px-3 py-2 min-w-[3rem] sm:min-w-[3.5rem]">
        <span className="font-display text-2xl sm:text-3xl text-white tabular-nums">
          {displayValue}
        </span>
      </div>
      <span className="text-white/40 text-[10px] sm:text-xs mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-white/30 font-display text-xl sm:text-2xl -mt-4">
      :
    </span>
  );
}
