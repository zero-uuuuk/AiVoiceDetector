import React, { useState, useEffect } from 'react';
import { Play, Pause, Bot, Fingerprint, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const PlayingView = ({
    questions,
    currentIdx,
    score,
    isPlaying,
    feedback,
    onTogglePlay,
    onGuess,
    onNext,
    canvasRef
}) => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = React.useRef(null);

    useEffect(() => {
        if (feedback && questions[currentIdx]?.audioUrl.includes('human_')) {
            // Reset logic
            setIsVideoPlaying(false);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.pause();
            }

            const timer = setTimeout(() => {
                setIsVideoPlaying(true);
                if (videoRef.current) {
                    videoRef.current.play().catch(e => console.log("Play failed", e));
                }
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsVideoPlaying(false);
        }
    }, [feedback, currentIdx, questions]);

    return (
        <>
            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 pt-24 pb-20 md:px-6 md:pt-32 md:pb-8 relative z-10 min-h-[100dvh] animate-fade-in-up">
                {/* Visualizer */}
                <div className="w-full aspect-[1.8/1] md:aspect-[2.5/1] relative mb-4 md:mb-6 group">
                    <div className="absolute inset-0 bg-neutral-900/30 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-50 pointer-events-none"></div>
                        {/* WaveSurfer Container */}
                        <canvas ref={canvasRef} width={1000} height={500} className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <button
                            onClick={onTogglePlay}
                            disabled={!!feedback}
                            className={`
                w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-500 ease-out touch-manipulation
                ${isPlaying
                                    ? 'bg-neutral-900/80 text-lime-400 shadow-[0_0_0_1px_rgba(163,230,53,0.2)] hover:scale-110 active:scale-95'
                                    : 'bg-lime-400 text-black shadow-[0_0_40px_rgba(163,230,53,0.4)] hover:scale-110 active:scale-95 hover:shadow-[0_0_60px_rgba(163,230,53,0.6)]'}
                ${!!feedback ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
              `}
                        >
                            {isPlaying ? <Pause className="w-6 h-6 md:w-9 md:h-9" fill="currentColor" /> : <Play className="w-6 h-6 md:w-9 md:h-9 ml-1" fill="currentColor" />}
                        </button>
                    </div>
                    {isPlaying && (
                        <div className="absolute bottom-3 md:bottom-4 left-0 right-0 text-center animate-pulse">
                            <span className="text-[10px] md:text-xs font-mono text-lime-400 tracking-[0.2em] uppercase">Processing Audio Stream...</span>
                        </div>
                    )}
                </div>

                {/* Guidance Text */}
                <div className="mb-6 md:mb-8 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-neutral-900/50 rounded-full border border-neutral-800 text-lime-400/90 text-xs md:text-sm font-medium animate-pulse">
                    <Volume2 size={14} className="md:w-4 md:h-4" />
                    <span>Listen carefully to the breathing & intonation</span>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 md:gap-8 w-full max-w-2xl mb-4 md:mb-8">
                    <button
                        onClick={() => onGuess('AI')}
                        disabled={!!feedback}
                        className={`
              relative group h-36 md:h-48 rounded-2xl md:rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-3 md:gap-4 overflow-hidden
              bg-neutral-900/60 hover:bg-neutral-800 backdrop-blur-md active:scale-[0.98] touch-manipulation
              ${!!feedback && 'opacity-30 grayscale'}
            `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-3 md:p-5 rounded-xl md:rounded-2xl bg-black/40 group-hover:bg-lime-400/20 group-hover:scale-110 transition-all duration-300 shadow-lg">
                            <Bot className="w-8 h-8 md:w-10 md:h-10 text-neutral-400 group-hover:text-lime-400 transition-colors" />
                        </div>
                        <div className="flex flex-col items-center relative">
                            <span className="text-base md:text-xl font-bold text-white group-hover:text-lime-400 transition-colors tracking-wide">AI 인공지능</span>
                            <span className="text-[10px] md:text-xs text-neutral-500 group-hover:text-lime-500/70 mt-0.5 md:mt-1 font-mono uppercase tracking-wider">Generated</span>
                        </div>
                    </button>

                    <button
                        onClick={() => onGuess('HUMAN')}
                        disabled={!!feedback}
                        className={`
              relative group h-36 md:h-48 rounded-2xl md:rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-3 md:gap-4 overflow-hidden
              bg-neutral-900/60 hover:bg-neutral-800 backdrop-blur-md active:scale-[0.98] touch-manipulation
              ${!!feedback && 'opacity-30 grayscale'}
            `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-3 md:p-5 rounded-xl md:rounded-2xl bg-black/40 group-hover:bg-cyan-400/20 group-hover:scale-110 transition-all duration-300 shadow-lg">
                            <Fingerprint className="w-8 h-8 md:w-10 md:h-10 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="flex flex-col items-center relative">
                            <span className="text-base md:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-wide">HUMAN 사람</span>
                            <span className="text-[10px] md:text-xs text-neutral-500 group-hover:text-cyan-500/70 mt-0.5 md:mt-1 font-mono uppercase tracking-wider">Authentic</span>
                        </div>
                    </button>
                </div>
            </main>

            {/* Feedback Overlay */}
            {feedback && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
                    <div className="flex flex-col items-center w-full max-w-md p-6 relative z-10">
                        {feedback === 'correct' ? (
                            <>
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-lime-500 blur-3xl opacity-20 animate-pulse"></div>
                                    <CheckCircle2 size={80} className="text-lime-400 relative z-10 md:w-[100px] md:h-[100px]" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">CORRECT</h2>
                                <p className="text-lime-400 font-mono tracking-widest text-xs md:text-sm uppercase mb-8 md:mb-10">Analysis Confirmed</p>
                            </>
                        ) : (
                            <>
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
                                    <XCircle size={80} className="text-red-500 relative z-10 md:w-[100px] md:h-[100px]" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">WRONG</h2>
                                <p className="text-red-400 font-mono tracking-widest text-xs md:text-sm uppercase">Analysis Failed</p>
                                <div className="mt-4 mb-8 md:mb-10 px-4 py-2 rounded bg-neutral-800 text-neutral-400 text-sm">
                                    Answer: <span className="text-white font-bold">{questions[currentIdx].type === 'AI' ? 'AI Generated' : 'Human Voice'}</span>
                                </div>
                            </>
                        )}

                        {/* Video Container for Human Voice */}
                        {questions[currentIdx].audioUrl.includes('human_') && (
                            <div className="w-full max-w-sm aspect-video rounded-2xl overflow-hidden mb-6 shadow-2xl border border-neutral-800 relative bg-black">
                                <video
                                    ref={videoRef}
                                    src={`/video/${questions[currentIdx].audioUrl.split('/').pop().replace('.mp3', '.mp4')}`}
                                    loop
                                    playsInline
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {!isVideoPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-lime-400 animate-spin"></div>
                                    </div>
                                )}
                                {/* Optional overlay/gradient if needed for better text visibility if we put text over it, 
                                    but here it's standalone. We can add a subtle inner shadow. */}
                                <div className="absolute inset-0 ring-1 ring-white/10 rounded-2xl pointer-events-none"></div>
                            </div>
                        )}

                        <button
                            onClick={onNext}
                            className={`
                group flex items-center justify-center gap-2 w-full py-3 md:py-4 px-8 rounded-xl font-bold text-base md:text-lg transition-all duration-300 touch-manipulation
                ${feedback === 'correct'
                                    ? 'bg-lime-400 text-black hover:bg-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.3)]'
                                    : 'bg-white text-black hover:bg-neutral-200'}
              `}
                        >
                            {currentIdx < questions.length - 1 ? 'Next Sample' : 'See Results'}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
