// S3 Bucket URLs
const S3_VOICE_URL = import.meta.env.VITE_S3_VOICE_URL;
const S3_VIDEO_URL = import.meta.env.VITE_S3_VIDEO_URL;

// Available File IDs (Based on files in client/public/voice and client/public/video)
const AVAILABLE_AI_IDS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    21, 22, 23, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40
];

const AVAILABLE_HUMAN_IDS = [
    3, 4, 5, 6,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37
];

/**
 * Fisher-Yates Shuffle
 */
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const generateQuestions = (totalRounds) => {
    // 1. Calculate counts for 1:1 ratio
    const half = Math.floor(totalRounds / 2);
    let aiCount = half;
    let humanCount = half;

    // Distribute remainder randomly
    if (totalRounds % 2 !== 0) {
        if (Math.random() > 0.5) aiCount++;
        else humanCount++;
    }

    // 2. Select Unique IDs (Shuffle and Slice)
    const selectedAiIds = shuffleArray(AVAILABLE_AI_IDS).slice(0, aiCount);
    const selectedHumanIds = shuffleArray(AVAILABLE_HUMAN_IDS).slice(0, humanCount);

    // 3. Create Question Objects
    const aiQuestions = selectedAiIds.map(id => ({
        type: 'AI',
        id: `ai_${id}`,
        audioUrl: `${S3_VOICE_URL}/ai_${id}.mp3`,
        videoUrl: `${S3_VIDEO_URL}/ai_${id}.mp4`
    }));

    const humanQuestions = selectedHumanIds.map(id => ({
        type: 'HUMAN',
        id: `human_${id}`,
        audioUrl: `${S3_VOICE_URL}/human_${id}.mp3`,
        videoUrl: `${S3_VIDEO_URL}/human_${id}.mp4`
    }));

    // 4. Combine and Shuffle
    const allQuestions = [...aiQuestions, ...humanQuestions];
    return shuffleArray(allQuestions).map((q, idx) => ({
        ...q,
        index: idx + 1 // Add a sequence number if needed
    }));
};

