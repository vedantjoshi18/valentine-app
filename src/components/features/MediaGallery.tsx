
'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/layout/GlassCard";
import { X } from "lucide-react";

// Mock images - in a real app these would be actual paths
const IMAGES = [
    { id: 1, src: "/memory1.jpeg", alt: "18 September 2025", span: "col-span-1 row-span-1", date: "18 September 2025" },
    { id: 2, src: "/memory2.jpeg", alt: "9 February 2025", span: "col-span-2 row-span-1", date: "9 February 2025" },
    { id: 3, src: "/memory3.jpg", alt: "6 December 2025", span: "col-span-1 row-span-2", date: "6 December 2025" },
    { id: 4, src: "/memory4.jpeg", alt: "16 September 2025", span: "col-span-1 row-span-1", date: "16 September 2025" },
    { id: 5, src: "/memory5.jpg", alt: "8 December 2025", span: "col-span-2 row-span-2", date: "8 December 2025" },
    { id: 6, src: "/memory6.jpeg", alt: "7 February 2025", span: "col-span-1 row-span-1", date: "7 February 2025" },
];

export function MediaGallery() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px]">
                {IMAGES.map((image) => (
                    <motion.div
                        key={image.id}
                        layoutId={`card-${image.id}`}
                        onClick={() => setSelectedId(image.id)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer group ${image.span}`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-bts-purple-900/20 group-hover:bg-transparent transition-colors z-10" />
                        <div className="w-full h-full bg-slate-800 animate-pulse">
                            {/* Fallback color/loader if image missing */}
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-bts-purple-800');
                                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                    e.currentTarget.parentElement!.innerHTML += '<span class="text-white/20">Image</span>';
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedId(null)}>
                        <motion.div
                            layoutId={`card-${selectedId}`}
                            className="w-full max-w-3xl aspect-video bg-bts-midnight rounded-2xl overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <img
                                    src={IMAGES.find(i => i.id === selectedId)?.src}
                                    alt="Selected memory"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-white/50 text-xl">Image Placeholder</span>';
                                    }}
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-white font-bold text-xl">Our Beautiful Memory</h3>
                                <p className="text-white/70">{IMAGES.find(i => i.id === selectedId)?.date}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
