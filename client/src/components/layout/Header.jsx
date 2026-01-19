import React from 'react';
import { Activity } from 'lucide-react';

export const Header = ({ showStats, currentIdx, totalRounds, score, onGoHome }) => (
    <header className="flex justify-between items-center px-4 md:px-10 h-16 md:h-20 z-50 w-full fixed top-0 left-0 bg-black/50 backdrop-blur-md border-b border-white/10 pointer-events-none transition-all duration-300">
        <div
            onClick={onGoHome}
            className="flex items-center gap-2 md:gap-3 select-none pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
        >
            <div className="bg-lime-400/10 p-1.5 md:p-2 rounded-lg backdrop-blur-sm border border-lime-400/20">
                <Activity className="text-lime-400 w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="font-bold text-base md:text-lg tracking-tight text-white/90">
                AI <span className="text-lime-400">VOICE</span><span className="hidden sm:inline"> DETECTOR</span>
            </span>
        </div>

        {showStats && (
            <div className="flex items-center gap-4 md:gap-8 pointer-events-auto">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest hidden md:block mb-1">Round</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg md:text-xl font-mono font-bold text-white">{currentIdx + 1}</span>
                        <span className="text-xs md:text-sm font-mono text-neutral-600">/ {totalRounds}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest hidden md:block mb-1">Score</span>
                    <span className="text-lg md:text-xl font-mono font-bold text-lime-400">{score}</span>
                </div>
            </div>
        )}
    </header>
);
