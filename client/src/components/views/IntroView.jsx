import React from 'react';
import { Activity, Play, Settings2 } from 'lucide-react';

export const IntroView = ({ selectedRounds, setSelectedRounds, onStart, isLoading }) => (
    <div className="z-10 flex-1 flex flex-col items-center justify-center w-full max-w-lg p-4 md:p-6 animate-fade-in-up">
        <div className="flex justify-center mb-6 md:mb-8 relative">
            <div className="absolute inset-0 bg-lime-500/20 blur-3xl rounded-full"></div>
            <Activity className="relative z-10 text-lime-400 animate-pulse w-16 h-16 md:w-20 md:h-20" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-3 md:mb-4 tracking-tighter text-white text-center">
            VOICE<br /><span className="text-lime-400">DETECTOR</span>
        </h1>
        <p className="text-neutral-400 mb-8 md:mb-10 text-base md:text-lg leading-relaxed text-center">
            AI 딥보이스 판별 테스트<br />
            기계와 사람을 구분할 수 있습니까?
        </p>

        {/* Round Selector */}
        <div className="w-full bg-neutral-900/50 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-white/10 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-white font-bold text-sm md:text-base">
                    <Settings2 size={18} className="text-lime-400" />
                    테스트 문제 수
                </span>
                <span className="text-xl md:text-2xl font-mono text-lime-400 font-bold">{selectedRounds}</span>
            </div>
            <input
                type="range"
                min="1"
                max="20"
                value={selectedRounds}
                onChange={(e) => setSelectedRounds(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-lime-400"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                <span>1</span>
                <span>10</span>
                <span>20</span>
            </div>
        </div>

        <button
            onClick={onStart}
            disabled={isLoading}
            className={`group relative inline-flex items-center justify-center w-full py-4 md:py-5 text-lg md:text-xl font-bold text-black transition-all duration-300 rounded-xl shadow-[0_0_40px_rgba(163,230,53,0.3)] touch-manipulation ${
                isLoading 
                    ? 'bg-neutral-600 cursor-not-allowed opacity-50' 
                    : 'bg-lime-400 hover:bg-lime-300 hover:scale-[1.02]'
            }`}
        >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-2"></div>
                    문제 불러오는 중...
                </>
            ) : (
                <>
                    <Play size={24} className="mr-2 fill-black" />
                    테스트 시작하기
                </>
            )}
        </button>
    </div>
);
