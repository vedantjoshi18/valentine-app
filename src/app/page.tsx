'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { MusicPlayer } from "@/components/features/MusicPlayer";
import { MediaGallery } from "@/components/features/MediaGallery";
import { Game } from "@/components/features/Game";
import { Proposal } from "@/components/features/Proposal";
import { GlassCard } from "@/components/layout/GlassCard";
import { ArrowDown, Heart, Sparkles, Music, Camera, Gamepad2 } from "lucide-react";

export default function Home() {
  const [gameWon, setGameWon] = useState(false);

  const sectionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8 z-10 max-w-4xl"
        >
          {/* Floating hearts decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex justify-center gap-4 mb-4"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart
                  className="text-pink-500/60"
                  size={20 + i * 4}
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black leading-tight pb-2"
          >
            <span className="shimmer-text">
              Welcome My Sweetheart
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed"
          >
            A little universe, crafted with love, just for you. 💜
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <a href="#music" className="glass-button px-6 py-3 rounded-full flex items-center gap-2 text-white/90 font-medium">
              <Music size={18} /> Listen Together
            </a>
            <a href="#gallery" className="glass-button px-6 py-3 rounded-full flex items-center gap-2 text-white/90 font-medium">
              <Camera size={18} /> Our Memories
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="text-white/40 w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* Music Section */}
      <section id="music" className="min-h-screen flex items-center justify-center px-4 py-24 relative">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto max-w-6xl"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bts-purple-500/20 border border-bts-purple-500/30 text-bts-lavender text-sm font-medium">
                <Sparkles size={16} /> Our Soundtrack
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Every Song Tells <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-bts-purple-500 to-bts-pink">Our Story</span>
              </h2>

              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                I know Khushi tujhe BTS kitna pasand hai and I promise you ek din I will definitely take you to their concert kisi valentine's day par ya normal day par bhi but yeh mera khudse aur tujhse ek wada hai. Abhi ke liye maine yeh concert banaya hai tere liye hehehehe I love you muahhhh.
              </p>

              <div className="space-y-3 pt-4">
                {[
                  { emoji: "🎧", text: "Maze se gaane suno aur yeh pura app dekho" },
                  { emoji: "🌙", text: "I LOVE YOUUUUUU MUAHHHHHHH" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-white/70"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <MusicPlayer />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="min-h-screen py-24 px-4">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto max-w-6xl space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-sm font-medium mx-auto">
              <Camera size={16} /> Photo Album
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Captured <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-bts-lavender">Moments</span>
            </h2>

            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Time stands still when I&apos;m with you. These are fragments of forever.
            </p>
          </div>

          <MediaGallery />
        </motion.div>
      </section>

      {/* Game Section */}
      <section id="game" className="min-h-screen flex items-center justify-center px-4 py-24 relative">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto max-w-4xl text-center space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bts-lavender/20 border border-bts-lavender/30 text-bts-lavender text-sm font-medium mx-auto">
              <Gamepad2 size={16} /> A Little Challenge
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white">
              One Last <span className="text-transparent bg-clip-text bg-gradient-to-r from-bts-purple-500 to-bts-lavender">Surprise</span>
            </h2>

            <p className="text-lg text-white/60 max-w-lg mx-auto">
              Prove your memory skills to unlock the final message!
            </p>
          </div>

          <Game onComplete={() => setGameWon(true)} />
        </motion.div>
      </section>

      {/* Proposal Overlay */}
      {gameWon && <Proposal />}

      {/* Footer */}
      <footer className="py-12 text-center space-y-4">
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            >
              <Heart size={16} className="text-pink-500/50" fill="currentColor" />
            </motion.div>
          ))}
        </div>
        <p className="text-white/30 text-sm">
          Made with 💜 for my Valentine
        </p>
      </footer>
    </main>
  );
}
