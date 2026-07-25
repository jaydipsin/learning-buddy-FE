export interface IDashboardInitialState {
  userName: string;
  airRank: number; // AI-generated rank for the user based on their performance
  lastMockTestDetails: ILastMockTestDetails;
  recommendations: {
    weakTopics: string[];
    suggestedResources: string[];
    nextSteps: string[];
  };

  strengthAreas: {
    topic: string;
    score: number; // Percentage score for the topic
  }[];

  needsImprovementAreas: {
    topic: string;
    score: number; // Percentage score for the topic
    subject: string; // Subject to which the topic belongs
    status: "improved" | "declined" | "same"; // To track if the performance in this topic has improved, declined, or stayed the same compared to the previous mock test
  }[];

  recentMockTests: {
    _id: string;
    date: Date;
    score: number;
    percentile: number;
    mockTestType: string;
    mockTestLabel: string;
  }[]; // List of recent mock tests with date, score, and percentile

  whatToDoNext: {
    action: string; // e.g., "Focus on weak topics", "Review last mock test analysis", "Attempt more questions"
    details: string; // Additional details or resources for the recommended action
    tag: string; // e.g., "Start Practice", "Review Analysis", "Explore Resources",
  }[];
}

export interface ILastMockTestDetails {
  date: Date | null;
  scoreDetails: {
    score: number;
    marksObtained: number;
    totalMarks: number;
    percentile: number;
  };
  questionAnalysis: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
  };
  attemptDetails: {
    attempts: number;
    timeTaken: number; // in seconds
    timeLimit: number; // in seconds
  };
  subjectWisePerformance: {
    subject: string;
    score: number;
    marksObtained: number;
    // totalMarks: number;
    percentile: number;
    timeTaken: number; // in seconds
    idealTime: number; // in seconds
    averageTimePerQuestion: number; // in seconds
    improvementStatus: "improved" | "declined" | "same" | null;
  }[];
  //   This is for future not plan to implement now

  mockRank: number;
}
