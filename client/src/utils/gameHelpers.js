// API base URL (환경변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * 서버에서 문제를 가져옵니다.
 * @param {number} count - 가져올 문제 수
 * @returns {Promise<Array>} 문제 배열
 */
export const generateQuestions = async (count) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/questions?count=${count}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 서버 응답 형식에 맞게 변환
        return data.questions.map((q, index) => ({
            id: q.id || index + 1,
            type: q.type, // "AI" or "HUMAN"
            audioUrl: q.audioUrl,
            videoUrl: q.videoUrl || null, // HUMAN일 때만 값이 있음, AI는 null
            name: q.name,
            ai_human: q.ai_human
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
    }
};
