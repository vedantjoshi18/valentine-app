'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import {
    Play, Pause, SkipForward, SkipBack, Heart, Music,
    Volume2, VolumeX, Volume1, List, Search, Shuffle,
    Repeat, Repeat1, X, Disc3
} from "lucide-react";
import { cn } from "@/lib/utils";
import songsData from "@/data/songs.json";

// Dynamic import react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player/youtube'), {
    ssr: false,
    loading: () => null
});

interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
    year: number;
    duration: number;
    youtubeId: string;
    genre: string;
}

const songs: Song[] = songsData.songs as Song[];

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set([1, 5, 10]));
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
    const [filterGenre, setFilterGenre] = useState<string>("all");
    const [filterYear, setFilterYear] = useState<string>("all");
    const [isReady, setIsReady] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const playerRef = useRef<any>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const currentSong = songs[currentSongIndex];

    // Get unique genres and years for filtering
    const genres = useMemo(() => {
        const uniqueGenres = [...new Set(songs.map(s => s.genre))].sort();
        return ["all", ...uniqueGenres];
    }, []);

    const years = useMemo(() => {
        const uniqueYears = [...new Set(songs.map(s => s.year))].sort((a, b) => b - a);
        return ["all", ...uniqueYears.map(String)];
    }, []);

    // Filter songs
    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            const matchesSearch = searchQuery === "" ||
                song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.album.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGenre = filterGenre === "all" || song.genre === filterGenre;
            const matchesYear = filterYear === "all" || song.year === parseInt(filterYear);
            return matchesSearch && matchesGenre && matchesYear;
        });
    }, [searchQuery, filterGenre, filterYear]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleProgress = useCallback((state: { playedSeconds: number }) => {
        if (!isNaN(state.playedSeconds)) {
            setProgress(state.playedSeconds);
        }
    }, []);

    const handleDuration = useCallback((dur: number) => {
        if (!isNaN(dur) && dur > 0) {
            setDuration(dur);
        }
    }, []);

    const handleEnded = useCallback(() => {
        if (repeat === 'one') {
            playerRef.current?.seekTo(0);
            setProgress(0);
        } else {
            nextSong();
        }
    }, [repeat]);

    const handleReady = useCallback(() => {
        setIsReady(true);
    }, []);

    const handleError = useCallback((error: any) => {
        console.log('Playback error, skipping to next song...', error);
        setTimeout(() => nextSong(), 1500);
    }, []);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const getNextSongIndex = useCallback(() => {
        if (shuffle) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * songs.length);
            } while (randomIndex === currentSongIndex && songs.length > 1);
            return randomIndex;
        }
        if (repeat === 'all' || currentSongIndex < songs.length - 1) {
            return (currentSongIndex + 1) % songs.length;
        }
        return currentSongIndex;
    }, [currentSongIndex, shuffle, repeat]);

    const nextSong = useCallback(() => {
        const nextIndex = getNextSongIndex();
        setCurrentSongIndex(nextIndex);
        setProgress(0);
        setDuration(0);
        setIsReady(false);
        setIsPlaying(true);
    }, [getNextSongIndex]);

    const previousSong = useCallback(() => {
        if (progress > 3 && playerRef.current) {
            playerRef.current.seekTo(0);
            setProgress(0);
        } else {
            const prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
            setCurrentSongIndex(prevIndex);
            setProgress(0);
            setDuration(0);
            setIsReady(false);
            setIsPlaying(true);
        }
    }, [progress, currentSongIndex]);

    const playSong = useCallback((index: number) => {
        const songIndex = songs.findIndex(s => s.id === filteredSongs[index].id);
        setCurrentSongIndex(songIndex);
        setProgress(0);
        setDuration(0);
        setIsReady(false);
        setIsPlaying(true);
    }, [filteredSongs]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const seekTime = percentage * (duration || currentSong.duration);
        setProgress(seekTime);
        playerRef.current?.seekTo(seekTime);
    };

    const toggleLike = useCallback((songId: number) => {
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(songId)) {
                newSet.delete(songId);
            } else {
                newSet.add(songId);
            }
            return newSet;
        });
    }, []);

    const cycleRepeat = useCallback(() => {
        setRepeat(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    }, []);

    const getCoverUrl = (youtubeId: string) =>
        `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

    const youtubeUrl = `https://www.youtube.com/watch?v=${currentSong.youtubeId}`;
    const progressPercent = (progress / (duration || currentSong.duration)) * 100;

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Hidden YouTube Player via react-player */}
            {isClient && (
                <div className="fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none">
                    <ReactPlayer
                        ref={playerRef}
                        url={youtubeUrl}
                        playing={isPlaying}
                        volume={isMuted ? 0 : volume}
                        muted={isMuted}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        onEnded={handleEnded}
                        onReady={handleReady}
                        onError={handleError}
                        width="1px"
                        height="1px"
                        config={{
                            playerVars: {
                                autoplay: 1,
                                controls: 0,
                                disablekb: 1,
                                fs: 0,
                                modestbranding: 1,
                                rel: 0,
                            }
                        }}
                    />
                </div>
            )}

            {/* Main Player Card */}
            <motion.div
                className={cn(
                    "relative rounded-3xl overflow-hidden",
                    "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]",
                    "border border-white/10 shadow-2xl shadow-purple-500/10"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Background Album Art Blur */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={getCoverUrl(currentSong.youtubeId)}
                        alt=""
                        className="w-full h-full object-cover scale-150 blur-3xl opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a2e]/80 to-[#1a1a2e]" />
                </div>

                <div className="relative z-10 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Music className="w-5 h-5 text-purple-400" />
                            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                {!isReady && isPlaying ? 'Loading...' : isPlaying ? 'Now Playing' : 'Paused'}
                            </span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowPlaylist(true)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <List className="w-5 h-5 text-white/70" />
                        </motion.button>
                    </div>

                    {/* Album Art */}
                    <motion.div
                        className="relative mx-auto w-56 h-56 mb-6"
                        animate={isPlaying && isReady ? { rotate: 360 } : { rotate: 0 }}
                        transition={isPlaying && isReady ? {
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        } : { duration: 0.5 }}
                    >
                        <div className={cn(
                            "absolute inset-0 rounded-full transition-all duration-500",
                            isPlaying
                                ? "bg-gradient-to-br from-purple-500/40 to-pink-500/40 animate-pulse"
                                : "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                        )} />
                        <div className="absolute inset-2 rounded-full overflow-hidden shadow-xl shadow-black/50 border-4 border-white/10">
                            <img
                                src={getCoverUrl(currentSong.youtubeId)}
                                alt={currentSong.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${currentSong.youtubeId}/hqdefault.jpg`;
                                }}
                            />
                        </div>

                        {/* Loading overlay */}
                        {!isReady && isPlaying && (
                            <div className="absolute inset-2 rounded-full bg-black/50 flex items-center justify-center">
                                <Disc3 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}

                        {/* Pulsing glow when playing */}
                        {isPlaying && isReady && (
                            <motion.div
                                className="absolute -inset-4 rounded-full bg-purple-500/20 blur-xl"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </motion.div>

                    {/* Song Info */}
                    <div className="text-center mb-6">
                        <motion.h3
                            key={currentSong.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl font-bold text-white mb-1 truncate"
                        >
                            {currentSong.title}
                        </motion.h3>
                        <p className="text-white/60 text-sm">{currentSong.artist}</p>
                        <p className="text-white/40 text-xs mt-1">{currentSong.album}</p>
                    </div>

                    {/* Progress Bar with Heart Slider */}
                    <div className="mb-4">
                        <div
                            className="relative h-2 bg-white/10 rounded-full cursor-pointer overflow-visible group"
                            onClick={handleProgressClick}
                        >
                            {/* Progress fill */}
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />

                            {/* Glowing Heart Slider 💜 */}
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                                style={{ left: `${Math.min(progressPercent, 100)}%` }}
                                animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            >
                                <div className="absolute inset-0 -m-2 bg-purple-500/50 rounded-full blur-md" />
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                                </div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-white/40">
                            <span>{formatTime(progress)}</span>
                            <span>{formatTime(duration || currentSong.duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShuffle(!shuffle)}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                shuffle ? "text-purple-400" : "text-white/50 hover:text-white/80"
                            )}
                        >
                            <Shuffle className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={previousSong}
                            className="p-2 text-white/80 hover:text-white transition-colors"
                        >
                            <SkipBack className="w-6 h-6" fill="currentColor" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePlay}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center",
                                "bg-gradient-to-br from-purple-500 to-pink-500",
                                "shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
                                "transition-shadow"
                            )}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 text-white" fill="white" />
                            ) : (
                                <Play className="w-6 h-6 text-white ml-1" fill="white" />
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={nextSong}
                            className="p-2 text-white/80 hover:text-white transition-colors"
                        >
                            <SkipForward className="w-6 h-6" fill="currentColor" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={cycleRepeat}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                repeat !== 'off' ? "text-purple-400" : "text-white/50 hover:text-white/80"
                            )}
                        >
                            {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                        </motion.button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleLike(currentSong.id)}
                            className="p-2"
                        >
                            <Heart
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    likedSongs.has(currentSong.id) ? "text-pink-500 fill-pink-500" : "text-white/50"
                                )}
                            />
                        </motion.button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-white/50 hover:text-white/80 transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : volume < 0.5 ? (
                                    <Volume1 className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    setIsMuted(false);
                                }}
                                className="w-20 h-1 accent-purple-500 bg-white/20 rounded-full cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Playlist Panel */}
            <AnimatePresence>
                {showPlaylist && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowPlaylist(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f23] rounded-t-3xl overflow-hidden"
                        >
                            {/* Handle */}
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1 bg-white/20 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-6 pb-4 border-b border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">BTS Playlist ({songs.length} songs) 💜</h2>
                                    <button
                                        onClick={() => setShowPlaylist(false)}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/70" />
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search songs, artists, albums..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex gap-2">
                                    <select
                                        value={filterGenre}
                                        onChange={(e) => setFilterGenre(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                                    >
                                        <option value="all">All Genres</option>
                                        {genres.slice(1).map(genre => (
                                            <option key={genre} value={genre}>{genre}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                                    >
                                        <option value="all">All Years</option>
                                        {years.slice(1).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <p className="text-white/40 text-xs mt-3">
                                    {filteredSongs.length} songs found
                                </p>
                            </div>

                            {/* Song List */}
                            <div className="overflow-y-auto max-h-[50vh] p-4 space-y-1">
                                {filteredSongs.map((song, index) => {
                                    const isCurrentSong = songs[currentSongIndex].id === song.id;
                                    return (
                                        <motion.button
                                            key={song.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(index * 0.02, 0.5) }}
                                            onClick={() => playSong(index)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                                isCurrentSong
                                                    ? "bg-purple-500/20 border border-purple-500/30"
                                                    : "hover:bg-white/5"
                                            )}
                                        >
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={getCoverUrl(song.youtubeId)}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`;
                                                    }}
                                                />
                                                {isCurrentSong && isPlaying && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <Disc3 className="w-5 h-5 text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 text-left min-w-0">
                                                <p className={cn(
                                                    "font-medium truncate",
                                                    isCurrentSong ? "text-purple-400" : "text-white"
                                                )}>
                                                    {song.title}
                                                </p>
                                                <p className="text-white/50 text-sm truncate">
                                                    {song.artist}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className="text-white/40 text-xs">
                                                    {formatTime(song.duration)}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleLike(song.id);
                                                    }}
                                                    className="p-1"
                                                >
                                                    <Heart
                                                        className={cn(
                                                            "w-4 h-4",
                                                            likedSongs.has(song.id) ? "text-pink-500 fill-pink-500" : "text-white/30"
                                                        )}
                                                    />
                                                </button>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Now Playing Mini */}
                            <div className="p-4 border-t border-white/10 bg-black/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                                        <img
                                            src={getCoverUrl(currentSong.youtubeId)}
                                            alt={currentSong.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{currentSong.title}</p>
                                        <p className="text-white/50 text-sm truncate">{currentSong.artist}</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={togglePlay}
                                        className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5 text-white" fill="white" />
                                        ) : (
                                            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
