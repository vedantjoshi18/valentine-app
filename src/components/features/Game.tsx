
'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Music, Star, Mic, Headphones, Disc, Crown, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { cn } from "@/lib/utils";

const ICONS = [Heart, Music, Star, Mic, Headphones, Disc, Crown, Sparkles];

interface Card {
    id: number;
    iconId: number;
    isFlipped: boolean;
    isMatched: boolean;
}

interface GameProps {
    onComplete: () => void;
}

export function Game({ onComplete }: GameProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);

    // Initialize game
    useEffect(() => {
        const duplicatedIcons = [...ICONS.slice(0, 6), ...ICONS.slice(0, 6)]; // 6 pairs = 12 cards
        const shuffled = duplicatedIcons
            .map((_, index) => ({
                id: index,
                iconId: index % 6,
                isFlipped: false,
                isMatched: false
            }))
            .sort(() => Math.random() - 0.5);

        setCards(shuffled);
    }, []);

    // Handle card click
    const handleCardClick = (id: number) => {
        // Prevent clicking if 2 cards already flipped or card is already matched/flipped
        if (flippedCards.length >= 2 || cards[id].isMatched || cards[id].isFlipped) return;

        // Flip card
        const newCards = [...cards];
        newCards[id].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        // Check match
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [firstId, secondId] = newFlipped;

            if (cards[firstId].iconId === cards[secondId].iconId) {
                // Match found
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[firstId].isMatched = true;
                    matchedCards[secondId].isMatched = true;
                    // Keep them flipped
                    setCards(matchedCards);
                    setFlippedCards([]);

                    // Check win condition
                    if (matchedCards.every(c => c.isMatched)) {
                        setTimeout(onComplete, 1000);
                    }
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstId].isFlipped = false;
                    resetCards[secondId].isFlipped = false;
                    setCards(resetCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <GlassCard className="max-w-xl mx-auto p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6">Match the Icons usually associated with BTS!</h2>

            <div className="grid grid-cols-4 gap-4 w-full">
                {cards.map((card, index) => {
                    const Icon = ICONS[card.iconId];
                    return (
                        <motion.div
                            key={card.id}
                            className={cn(
                                "aspect-square rounded-xl cursor-pointer perspective-1000 relative",
                                (card.isFlipped || card.isMatched) ? "pointer-events-none" : ""
                            )}
                            onClick={() => handleCardClick(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div
                                className={cn(
                                    "w-full h-full transition-all duration-500 transform-style-3d relative",
                                    (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
                                )}
                                style={{ transformStyle: 'preserve-3d', transform: (card.isFlipped || card.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                            >
                                {/* Front (Hidden) */}
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                                    <span className="text-2xl">💜</span>
                                </div>

                                {/* Back (Revealed) */}
                                <div
                                    className="absolute inset-0 bg-bts-purple-500 rounded-xl flex items-center justify-center backface-hidden"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <Icon className="text-white w-8 h-8" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 text-white/50">
                Moves: {moves}
            </div>
        </GlassCard>
    );
}
