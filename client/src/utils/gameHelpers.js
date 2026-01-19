const AI_FILES = ['ai_1.mp3', 'ai_2.mp3'];
const HUMAN_FILES = ['human_1.mp3']; // Add more human files as they become available

export const generateQuestions = (count) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
        const isAi = Math.random() > 0.5;
        // Ensure we try to balance available files or just random pick
        const type = isAi ? 'AI' : 'HUMAN';

        let filename;
        if (type === 'AI') {
            filename = AI_FILES[Math.floor(Math.random() * AI_FILES.length)];
        } else {
            filename = HUMAN_FILES[Math.floor(Math.random() * HUMAN_FILES.length)];
        }

        questions.push({
            id: i + 1,
            type: type,
            difficulty: Math.random() > 0.7 ? 'Hard' : 'Normal',
            audioUrl: `/voice/${filename}`
        });
    }
    return questions;
};
