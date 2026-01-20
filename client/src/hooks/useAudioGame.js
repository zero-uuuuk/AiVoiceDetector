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
    const [feedback, setFeedback] = useState(null); // null, 'correct', 'wrong'
    const [audioContext, setAudioContext] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // 게임 시작 로딩 상태

    // Refs
    // Refs
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const audioBufferRef = useRef(null);
    const loadedBufferUrlRef = useRef(null);
    const gainNodeRef = useRef(null);
    const sfxBuffersRef = useRef({ correct: null, wrong: null });

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
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(ctx);
        }
        if (ctx.state === 'suspended') await ctx.resume();

        if (!analyserRef.current) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;
        }

        try {
            const currentQuestion = questions[currentIdx];
            if (!currentQuestion || !currentQuestion.audioUrl) {
                console.error("No audio URL found for current question");
                setIsPlaying(false);
                return;
            }

            // Load audio if not cached or if URL has changed
            if (!audioBufferRef.current || loadedBufferUrlRef.current !== currentQuestion.audioUrl) {
                const response = await fetch(currentQuestion.audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
                loadedBufferUrlRef.current = currentQuestion.audioUrl;
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

            // Optional: Limit to 5 seconds like before, or let the file length dictate?
            // User asked to use test.mp3. It's safe to assume they want to hear the file.
            // I'll keep the timeout as a safeguard for very long files, but extend it or remove it.
            // Original was 5s. I'll comment it out to play the full file (assuming clips are short).
            /*
            setTimeout(() => {
                if (sourceNodeRef.current === source) stopAudio();
            }, 5000);
            */

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
    const startGame = async () => {
        if (isLoading) return; // 이미 로딩 중이면 중복 실행 방지
        
        // Initialize AudioContext on user gesture (Start Game) to ensure it's ready for SFX
        if (!audioContext) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(ctx);
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        setIsLoading(true);
        try {
            const newQuestions = await generateQuestions(selectedRounds);
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
        } catch (error) {
            console.error('Failed to start game:', error);
            // 에러 처리: 사용자에게 알림 표시
            const errorMessage = error.message || '문제를 불러오는데 실패했습니다.';
            alert(`에러: ${errorMessage}\n\n서버가 실행 중인지 확인해주세요. (http://localhost:8000)`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuess = (guessType) => {
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
        feedback,
        isLoading,
        canvasRef,
        startGame,
        goHome,
        togglePlay,
        handleGuess,
        handleNext
    };
}
