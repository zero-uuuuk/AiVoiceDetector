import { useState, useRef, useCallback, useEffect } from 'react';
import { generateQuestions } from '../utils/gameHelpers';

export function useAudioGame() {
    // Game State
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedRounds, setSelectedRounds] = useState(5);

    // Scoring
    const [aiScore, setAiScore] = useState(0);
    const [humanScore, setHumanScore] = useState(0);
    const [aiTotal, setAiTotal] = useState(0);
    const [humanTotal, setHumanTotal] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add Loading State
    const [feedback, setFeedback] = useState(null); // null, 'correct', 'wrong'
    const [audioContext, setAudioContext] = useState(null);

    // Refs
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const audioBufferRef = useRef(null);
    const bufferCacheRef = useRef({}); // Cache for decoded audio
    const gainNodeRef = useRef(null);
    const sfxBuffersRef = useRef({ correct: null, wrong: null });

    // Helper: Load and Decode Audio
    const loadAudioBuffer = useCallback(async (url) => {
        if (!audioContext || !url) return null;

        // Return cached if available
        if (bufferCacheRef.current[url]) {
            return bufferCacheRef.current[url];
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
            bufferCacheRef.current[url] = decodedBuffer;
            return decodedBuffer;
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
            return null;
        }
    }, [audioContext]);

    // Effect: Load Current Audio & Preload Next
    useEffect(() => {
        const currentQuestion = questions[currentIdx];
        if (!currentQuestion || !audioContext) return;

        let isMounted = true;

        const prepareAudio = async () => {
            // 1. Load Current Track
            setIsLoading(true);
            const buffer = await loadAudioBuffer(currentQuestion.audioUrl);

            if (isMounted) {
                if (buffer) {
                    audioBufferRef.current = buffer;
                } else {
                    audioBufferRef.current = null; // Clear if loading failed
                }
                setIsLoading(false);
            }

            // 2. Preload Next Track (Background)
            const nextQuestion = questions[currentIdx + 1];
            if (nextQuestion && isMounted) {
                loadAudioBuffer(nextQuestion.audioUrl);
            }
        };

        prepareAudio();

        return () => { isMounted = false; };
    }, [currentIdx, questions, audioContext, loadAudioBuffer]);


    // Audio Methods
    const stopAudio = useCallback(() => {
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
            } catch (e) { /* ignore cleanup errors */ }
            sourceNodeRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsPlaying(false);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.strokeStyle = '#365314';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }, []);

    const playAudio = useCallback(async () => {
        let ctx = audioContext;
        if (!ctx) return; // Should be initialized
        if (ctx.state === 'suspended') await ctx.resume();

        if (!analyserRef.current) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;
        }

        try {
            if (!audioBufferRef.current) {
                console.warn("Audio buffer not ready yet");
                return;
            }

            const source = ctx.createBufferSource();
            source.buffer = audioBufferRef.current;
            const gainNode = ctx.createGain();

            // Connect graph
            source.connect(gainNode);
            gainNode.connect(analyserRef.current);
            analyserRef.current.connect(ctx.destination);

            source.start(0);
            sourceNodeRef.current = source;
            gainNodeRef.current = gainNode;
            setIsPlaying(true);

            // Handle auto-stop (either file end or timeout)
            source.onended = () => {
                // Only stop if it was this specific source that ended (and we are still playing)
                // However, onended might fire when we manually stop() too.
                // We'll let stopAudio handle state.
                if (sourceNodeRef.current === source) {
                    stopAudio();
                }
            };

            // Visualization - Multi-Wave Siri Style
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let phase = 0; // Animation phase

            const draw = () => {
                if (!sourceNodeRef.current) return;

                const canvas = canvasRef.current;
                if (!canvas) return; // Guard clause

                const canvasCtx = canvas.getContext('2d');
                if (!canvasCtx) return;

                animationRef.current = requestAnimationFrame(draw);
                analyserRef.current.getByteTimeDomainData(dataArray);

                // Calculate Volume (RMS) for amplitude modulation
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const deviation = (dataArray[i] - 128) / 128.0;
                    sum += deviation * deviation;
                }
                const rms = Math.sqrt(sum / bufferLength);
                // Boost low volumes, cap max
                const volume = Math.min(rms * 4.0, 1.2);

                // Clear with slight transparency if we wanted tails, but full clear is cleaner for this style
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                const width = canvas.width;
                const height = canvas.height;
                const midY = height / 2;

                phase += 0.15; // Animation speed

                // Define 3 waves: [color, amplitudeScaler, frequency, speed]
                const waves = [
                    { color: 'rgba(163, 230, 53, 0.4)', amp: 0.8, freq: 0.01, speed: 0.5 }, // Faint secondary
                    { color: 'rgba(56, 189, 248, 0.5)', amp: 1.0, freq: 0.02, speed: 0.8 }, // Cyan secondary
                    { color: '#a3e635', amp: 1.2, freq: 0.015, speed: 1.0 }  // Primary Lime
                ];

                waves.forEach((wave, idx) => {
                    canvasCtx.beginPath();
                    canvasCtx.lineWidth = idx === 2 ? 4 : 2; // Main wave thicker
                    canvasCtx.strokeStyle = wave.color;

                    if (idx === 2) {
                        canvasCtx.shadowBlur = 20;
                        canvasCtx.shadowColor = '#65a30d';
                    } else {
                        canvasCtx.shadowBlur = 0;
                    }

                    for (let x = 0; x < width; x += 5) { // Step 5 for performance
                        // Math.sin(x * frequency + (phase * speed))
                        const sineValue = Math.sin(x * wave.freq + (phase * wave.speed));

                        // Apply volume and envelope (taper at ends)
                        // Taper: (x / width) * (1 - x / width) * 4  makes parabolic curve 0->1->0
                        const envelope = (x / width) * (1 - (x / width)) * 4;

                        // Base amplitude + Volume Reaction
                        const amplitude = (height * 0.25) * volume * wave.amp * envelope;

                        const y = midY + sineValue * amplitude;

                        if (x === 0) canvasCtx.moveTo(x, y);
                        else canvasCtx.lineTo(x, y);
                    }
                    canvasCtx.stroke();
                });
            };

            draw();

        } catch (error) {
            console.error("Failed to play audio:", error);
            setIsPlaying(false);
        }


    }, [audioContext, stopAudio, questions, currentIdx]);

    const togglePlay = () => {
        if (isLoading) return; // Prevent double click
        if (isPlaying) stopAudio();
        else playAudio();
    };

    // Load SFX when AudioContext is available
    useEffect(() => {
        if (!audioContext) return;

        const loadSfx = async (url, type) => {
            if (sfxBuffersRef.current[type]) return; // Already loaded

            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
                sfxBuffersRef.current[type] = decodedBuffer;
            } catch (error) {
                console.error(`Failed to load SFX: ${url}`, error);
            }
        };

        loadSfx('/sound/correct.mp3', 'correct');
        loadSfx('/sound/wrong.mp3', 'wrong');
    }, [audioContext]);

    // Game Logic Methods
    const startGame = () => {
        // Initialize AudioContext on user gesture (Start Game) to ensure it's ready for SFX
        if (!audioContext) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(ctx);
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const newQuestions = generateQuestions(selectedRounds);
        setQuestions(newQuestions);
        setAiScore(0);
        setHumanScore(0);

        const aiCount = newQuestions.filter(q => q.type === 'AI').length;
        setAiTotal(aiCount);
        setHumanTotal(newQuestions.length - aiCount);

        setCurrentIdx(0);
        setGameState('playing');
        setFeedback(null);
        setIsPlaying(false);
    };

    const handleGuess = (guessType) => {
        if (isLoading) return; // Prevent guess while loading
        stopAudio();
        const currentQ = questions[currentIdx];
        const isCorrect = currentQ.type === guessType;

        // Play feedback sound with Low Latency (Web Audio API)
        const sfxType = isCorrect ? 'correct' : 'wrong';
        const buffer = sfxBuffersRef.current[sfxType];

        if (audioContext && buffer) {
            if (audioContext.state === 'suspended') audioContext.resume();

            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            const gain = audioContext.createGain();
            gain.gain.value = 0.5; // 50% Volume
            source.connect(gain);
            gain.connect(audioContext.destination);
            source.start(0);
        } else {
            // Fallback
            const soundFile = isCorrect ? '/sound/correct.mp3' : '/sound/wrong.mp3';
            const audio = new Audio(soundFile);
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Error playing sound:", e));
        }

        if (isCorrect) {
            if (currentQ.type === 'AI') setAiScore(s => s + 1);
            else setHumanScore(s => s + 1);
        }
        setFeedback(isCorrect ? 'correct' : 'wrong');
    };

    const handleNext = () => {
        setFeedback(null);
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(c => c + 1);
        } else {
            setGameState('finished');
        }
    };

    const goHome = () => {
        setGameState('intro');
        setIsPlaying(false);
        setFeedback(null);
    };

    // Cleanup
    useEffect(() => {
        return () => stopAudio();
    }, [stopAudio]);

    return {
        gameState,
        questions,
        currentIdx,
        selectedRounds,
        setSelectedRounds,
        score: aiScore + humanScore,
        aiScore,
        humanScore,
        aiTotal,
        humanTotal,
        isPlaying,
        isLoading,
        feedback,
        canvasRef,
        startGame,
        goHome,
        togglePlay,
        handleGuess,
        handleNext
    };

}
