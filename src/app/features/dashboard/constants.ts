import { IDashboardInitialState } from "./interface";

export const initialDashboardState: IDashboardInitialState = {
    userName: "",
    airRank: 0,
    lastMockTestDetails: {
        date: null,
        scoreDetails: {
            score: 0,
            marksObtained: 0,
            totalMarks: 0,
            percentile: 0,
        },
        questionAnalysis: {
            totalQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
        },
        attemptDetails: {
            attempts: 0,
            timeTaken: 0,
            timeLimit: 0,
        },
        subjectWisePerformance: [],
        mockRank: 0,
    },
    recommendations: {
        weakTopics: [],
        suggestedResources: [],
        nextSteps: [],
    },
    strengthAreas: [],
    needsImprovementAreas: [],
    recentMockTests: [],
    whatToDoNext: [],
}