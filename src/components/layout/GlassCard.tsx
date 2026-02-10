'use client';

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'purple' | 'pink' | 'blue';
}

export function GlassCard({
  children,
  className,
  hoverEffect = false,
  glowColor = 'purple',
  ...props
}: GlassCardProps) {
  const glowColors = {
    purple: 'group-hover:shadow-bts-purple-500/20',
    pink: 'group-hover:shadow-pink-500/20',
    blue: 'group-hover:shadow-blue-500/20',
  };

  return (
    <motion.div
      className={cn(
        "group relative rounded-3xl p-6 overflow-hidden",
        "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
        "backdrop-blur-xl border border-white/10",
        "shadow-xl shadow-black/10",
        hoverEffect && [
          "hover:border-white/20 transition-all duration-500",
          `hover:shadow-2xl ${glowColors[glowColor]}`
        ],
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Animated border shimmer */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
