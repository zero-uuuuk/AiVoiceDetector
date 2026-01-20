import React from 'react';
import { useAudioGame } from './hooks/useAudioGame';
import { IntroView } from './components/views/IntroView';
import { PlayingView } from './components/views/PlayingView';
import { FinishedView } from './components/views/FinishedView';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

function App() {
    const {
        gameState,
        questions,
        currentIdx,
        selectedRounds,
        setSelectedRounds,
        score,
        aiScore,
        aiTotal,
        humanScore,
        humanTotal,
        isPlaying,
        feedback,
        isLoading,
        canvasRef,
        startGame,
        goHome,
        togglePlay,
        handleGuess,
        handleNext
    } = useAudioGame();

    const showStats = gameState === 'playing';

    return (
        <div className="min-h-[100dvh] bg-black text-lime-400 font-sans flex flex-col items-center justify-between relative overflow-x-hidden">
            {/* Common Background */}
            {/* Dynamic Tech Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* 1. Base Gradient */}
                <div className="absolute inset-0 bg-neutral-900"></div>

                {/* 2. Animated Aurora Blobs - Intensified & Responsive */}
                <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] md:w-[600px] md:h-[600px] bg-lime-500/30 rounded-full mix-blend-screen filter blur-[60px] md:blur-[80px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] md:w-[500px] md:h-[500px] bg-cyan-500/30 rounded-full mix-blend-screen filter blur-[60px] md:blur-[80px] animate-blob" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[90vw] h-[90vw] md:w-[800px] md:h-[800px] bg-lime-900/40 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>

                {/* 3. Tech Grid Overlay - More visible */}
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

                {/* 4. Vignette for focus - Adjusted to not hide edges too much */}
                <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_rgba(0,0,0,0.8)_100%)]"></div>
            </div>

            {/* Common Header */}
            <Header
                showStats={showStats}
                currentIdx={currentIdx}
                totalRounds={questions.length}
                score={score}
                onGoHome={goHome}
            />

            {/* View Content */}
            {gameState === 'intro' && (
                <IntroView
                    selectedRounds={selectedRounds}
                    setSelectedRounds={setSelectedRounds}
                    onStart={startGame}
                    isLoading={isLoading}
                />
            )}

            {gameState === 'playing' && (
                <PlayingView
                    questions={questions}
                    currentIdx={currentIdx}
                    score={score}
                    isPlaying={isPlaying}
                    feedback={feedback}
                    onTogglePlay={togglePlay}
                    onGuess={handleGuess}
                    onNext={handleNext}
                    canvasRef={canvasRef}
                />
            )}

            {gameState === 'finished' && (
                <FinishedView
                    questions={questions}
                    score={score}
                    aiScore={aiScore}
                    aiTotal={aiTotal}
                    humanScore={humanScore}
                    humanTotal={humanTotal}
                    onGoHome={goHome}
                />
            )}

            {/* Common Footer */}
            <Footer />
        </div>
    );
}

export default App;
