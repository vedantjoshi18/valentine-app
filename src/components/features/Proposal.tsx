'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';

export function Proposal() {
    const [step, setStep] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [yesScale, setYesScale] = useState(1);
    const [showDrumRoll, setShowDrumRoll] = useState(false);

    // New state for timed sequence
    const [showFinalQuestion, setShowFinalQuestion] = useState(false);
    const [finalTextIndex, setFinalTextIndex] = useState(-1);

    const finalWords = [
        "WILL", "YOU", "BE", "MY",
        "PAKKA", "WALA",
        "EKDUM LOVELY WALA",
        "CUTE WALA",
        "SEXY WALA",
        "PYARA WALA",
        "HOT WALA",
        "EKDUM MERA",
        "VALENTINEEEEE HEHEHEHEHE"
    ];

    // Step 0: Love Question Options
    const loveOptions = [
        { id: 'a', text: 'Yes 💖' },
        { id: 'b', text: 'Obviously Yes 🥰' },
        { id: 'c', text: 'Chappal phek ke marungi 🩴' },
        { id: 'd', text: 'BAHUTTTTTTTT ZYADA 💑' },
    ];

    const toggleOption = (id: string) => {
        setSelectedOptions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleStep0Submit = () => {
        if (selectedOptions.length === 0) return;

        const message = document.createElement('div');
        message.innerText = "Mujhe pata tha yahi choose karegi! 😉";
        message.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 1000; font-size: 1.5rem; text-align: center;";
        document.body.appendChild(message);

        setTimeout(() => {
            document.body.removeChild(message);
            setStep(1);
        }, 2000);
    };

    // Step 1: Suspense
    const handleStep1Submit = (ready: boolean) => {
        if (ready) {
            setShowDrumRoll(true);
            setTimeout(() => {
                setShowDrumRoll(false);
                setStep(2);
            }, 3000);
        } else {
            alert("No is not an option! 😤");
        }
    };

    // Sequence Effect for Step 2
    useEffect(() => {
        if (step === 2) {
            // Initial 5s delay after "I LOVE YOU BAHUT ZYADA"
            const initialTimer = setTimeout(() => {
                setFinalTextIndex(0); // Start showing words

                const interval = setInterval(() => {
                    setFinalTextIndex(prev => {
                        if (prev >= finalWords.length - 1) {
                            clearInterval(interval);
                            setShowFinalQuestion(true); // Show buttons
                            return prev;
                        }
                        return prev + 1;
                    });
                }, 2000); // 2s delay between words

                return () => clearInterval(interval);
            }, 5000);

            return () => clearTimeout(initialTimer);
        }
    }, [step]);


    // Step 2: Final Proposal Interaction
    const handleNoClick = () => {
        setYesScale(prev => prev + 1.5); // Make Yes bigger significantly
    };

    const handleAccept = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF69B4', '#9370DB', '#FFC0CB']
        });
        setStep(3);
    };

    // Render Logic
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
            <div
                className="relative w-full max-w-2xl bg-white/10 border border-white/20 rounded-3xl p-8 lg:p-12 text-center shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center items-center"
            >
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <motion.div
                        className="absolute top-0 left-0 w-full h-full opacity-10"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ff69b4 2px, transparent 2.5px)',
                            backgroundSize: '30px 30px'
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: Love Question */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full space-y-8"
                        >
                            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                                Do you love me <span className="text-pink-500">bahut zyada</span>? 🥺
                            </h2>
                            <p className="text-white/60 text-sm">(Select all that apply)</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loveOptions.map((opt) => (
                                    <motion.button
                                        key={opt.id}
                                        onClick={() => toggleOption(opt.id)}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all text-left flex items-center justify-between",
                                            selectedOptions.includes(opt.id)
                                                ? "bg-pink-500/20 border-pink-500 text-white"
                                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                        )}
                                    >
                                        <span>{opt.text}</span>
                                        {selectedOptions.includes(opt.id) && <Check className="w-5 h-5 text-pink-500" />}
                                    </motion.button>
                                ))}
                            </div>

                            <button
                                onClick={handleStep0Submit}
                                disabled={selectedOptions.length === 0}
                                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Answer
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: Suspense */}
                    {step === 1 && !showDrumRoll && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="space-y-8"
                        >
                            <h2 className="text-3xl lg:text-5xl font-bold text-white">
                                Are you ready for the final question? 🫣
                            </h2>

                            <div className="flex gap-6 justify-center">
                                <button
                                    onClick={() => handleStep1Submit(true)}
                                    className="px-8 py-3 bg-green-500 text-white font-bold rounded-full text-xl hover:bg-green-600 transition-colors"
                                >
                                    Yes, I was born ready!
                                </button>
                                <button
                                    onClick={() => handleStep1Submit(false)}
                                    className="px-8 py-3 bg-red-500/20 text-white/80 font-bold rounded-full text-xl hover:bg-red-500/40 transition-colors"
                                >
                                    No (Too bad)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {showDrumRoll && (
                        <motion.div
                            key="drumroll"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 0.2 }}
                            >
                                <span className="text-8xl">🥁</span>
                            </motion.div>
                            <h3 className="text-3xl font-bold text-white mt-8 animate-pulse">
                                Building Suspense...
                            </h3>
                        </motion.div>
                    )}

                    {/* STEP 2: Main Proposal */}
                    {step === 2 && (
                        <div className="space-y-8 w-full z-10">
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                                    KHUSHI MALVIYA
                                </h1>
                                <p className="text-2xl lg:text-3xl text-white font-bold">
                                    first of all I LOVE YOU BAHUT ZYADAAAA ❤️
                                </p>
                            </motion.div>

                            {/* Timed Sequence Display */}
                            <div className="min-h-[100px] flex items-center justify-center flex-col gap-2">
                                <AnimatePresence mode="popLayout">
                                    {finalTextIndex >= 0 && (
                                        <motion.div
                                            key={finalTextIndex}
                                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="text-3xl lg:text-5xl font-black text-white drop-shadow-lg text-center"
                                        >
                                            {finalWords[finalTextIndex]}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {showFinalQuestion && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative h-60 flex items-center justify-center pt-8"
                                >
                                    <motion.button
                                        style={{ scale: yesScale }}
                                        onClick={handleAccept}
                                        className="relative z-20 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-full text-2xl shadow-xl hover:shadow-pink-500/40 transition-shadow"
                                    >
                                        YES! 💜
                                    </motion.button>

                                    <motion.button
                                        onClick={handleNoClick}
                                        className="absolute bottom-0 right-10 whitespace-nowrap z-10 px-6 py-3 bg-gray-500/30 text-white/50 font-bold rounded-full text-lg backdrop-blur-sm hover:bg-gray-500/50 transition-colors"
                                    >
                                        No
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === 3 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 flex flex-col items-center"
                        >
                            <img
                                src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif"
                                alt="Cute Bear"
                                className="w-64 h-64 object-contain rounded-2xl"
                            />

                            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 leading-tight">
                                YAYYYYY MERI BABELAZIZI NE YES BOLA
                            </h1>
                            <p className="text-2xl text-white/90 font-bold">
                                I LOVE YOUUUU BABYYYYY HEHEHE MUAAHHHH 💖
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
