

import React from 'react';
import { Activity, Bot, Fingerprint, Home } from 'lucide-react';

export const FinishedView = ({
    questions,
    score,
    aiScore,
    aiTotal,
    humanScore,
    humanTotal,
    onGoHome
}) => {
    const totalScore = aiScore + humanScore;
    const totalQuestions = questions.length;
    const percentage = Math.round((totalScore / totalQuestions) * 100);

    // Calculate stats for bars
    const aiPercentage = aiTotal > 0 ? Math.round((aiScore / aiTotal) * 100) : 0;
    const humanPercentage = humanTotal > 0 ? Math.round((humanScore / humanTotal) * 100) : 0;

    return (<main className="flex-1 flex items-center justify-center w-full max-w-5xl px-4 pt-24 pb-20 md:px-6 md:pt-32 md:pb-8 relative z-10 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 w-full items-center">

            {/* Left Column: Overall Score */}
            <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-neutral-900/30 rounded-3xl border border-white/5 backdrop-blur-sm self-stretch">
                <div className="relative mb-6 md:mb-8">
                    {/* Circle Chart */}
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-8 border-neutral-900 flex items-center justify-center relative bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(163,230,53,0.3)]" viewBox="0 0 256 256">
                            <circle cx="128" cy="128" r="110" stroke="#171717" strokeWidth="12" fill="transparent" />
                            <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-lime-400" strokeDasharray={691} strokeDashoffset={691 - (691 * percentage) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                            <span className="block text-4xl md:text-5xl font-black text-white leading-none mb-1">{percentage}%</span>
                            <span className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-widest font-medium">Total Accuracy</span>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">분석 완료</h2>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-neutral-800 border border-neutral-700">
                        <span className="text-neutral-300 text-sm font-medium">총 <span className="text-lime-400 font-bold">{totalScore}</span> / {totalQuestions} 정답</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Detailed Stats */}
            <div className="flex flex-col gap-4 md:gap-6 w-full">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Activity size={20} className="text-lime-400" />
                    상세 분석 결과
                </h3>

                {/* AI Stats */}
                <div className="bg-neutral-900/50 p-5 md:p-6 rounded-2xl border border-white/10 hover:border-lime-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-800 rounded-lg">
                                <Bot className="w-5 h-5 md:w-6 md:h-6 text-lime-400" />
                            </div>
                            <div>
                                <span className="block font-bold text-white text-sm md:text-base">AI 음성</span>
                                <span className="text-[10px] md:text-xs text-neutral-500">생성된 목소리 탐지율</span>
                            </div>
                        </div>
                        <span className="text-xl md:text-2xl font-mono font-bold text-lime-400">{aiScore} <span className="text-sm text-neutral-600">/ {aiTotal}</span></span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 md:h-4 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-lime-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${aiPercentage}%` }}></div>
                    </div>
                    <div className="text-right mt-2 text-[10px] md:text-xs text-neutral-400 font-mono">{aiPercentage}% Accuracy</div>
                </div>

                {/* Human Stats */}
                <div className="bg-neutral-900/50 p-5 md:p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-800 rounded-lg">
                                <Fingerprint className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                            </div>
                            <div>
                                <span className="block font-bold text-white text-sm md:text-base">실제 음성</span>
                                <span className="text-[10px] md:text-xs text-neutral-500">사람 목소리 식별률</span>
                            </div>
                        </div>
                        <span className="text-xl md:text-2xl font-mono font-bold text-cyan-400">{humanScore} <span className="text-sm text-neutral-600">/ {humanTotal}</span></span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 md:h-4 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${humanPercentage}%` }}></div>
                    </div>
                    <div className="text-right mt-2 text-[10px] md:text-xs text-neutral-400 font-mono">{humanPercentage}% Accuracy</div>
                </div>

                <button
                    onClick={onGoHome}
                    className="mt-2 md:mt-4 flex items-center justify-center gap-2 w-full py-3 md:py-4 bg-white text-black font-bold text-base md:text-lg rounded-xl hover:bg-neutral-200 transition-all touch-manipulation"
                >
                    <Home size={20} /> 홈으로 돌아가기
                </button>
            </div>

        </div>
    </main>
    );
};
