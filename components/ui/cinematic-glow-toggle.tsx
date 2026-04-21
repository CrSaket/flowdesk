"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

interface CinematicSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function CinematicSwitch({
  checked,
  onChange,
  disabled = false,
  className,
}: CinematicSwitchProps) {
  return (
    <motion.div
      className={cn(
        "relative w-12 h-6 rounded-full cursor-pointer select-none",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
      initial={false}
      animate={{ backgroundColor: checked ? "#1a3a2a" : "#1C1833" }}
      transition={{ duration: 0.25 }}
      style={{ border: `1px solid ${checked ? "rgba(0,229,160,0.3)" : "rgba(255,255,255,0.08)"}` }}
    >
      <motion.div
        className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full border border-white/10"
        initial={false}
        animate={{
          x: checked ? 24 : 0,
          backgroundColor: checked ? "#00E5A0" : "#3d3a5c",
          boxShadow: checked ? "0 0 10px rgba(0,229,160,0.6)" : "none",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        whileTap={{ scale: 0.85 }}
      >
        <div className="absolute top-[3px] left-[4px] w-[6px] h-[3px] bg-white/25 rounded-full blur-[0.5px]" />
      </motion.div>
    </motion.div>
  );
}
