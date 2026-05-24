import type {
  InterviewAnswerEvaluation,
  InterviewLiveScores,
} from "@/modules/work-simulator/types"

export type {
  InterviewAnswerEvaluation,
  InterviewDifficulty,
  InterviewLiveScores,
  InterviewQuestion,
  InterviewQuestionCategory,
} from "@/modules/work-simulator/types"

export interface InterviewProgress {
  current: number
  total: number
}

export type InterviewStreamEvent =
  | { type: "connected" }
  | {
      type: "question"
      question: {
        id: number
        text: string
        category: string
        difficulty: string
        focus_area: string
      }
      progress: InterviewProgress
    }
  | { type: "transcript"; transcript: string; question_id: number }
  | { type: "analysis_started"; question_id: number }
  | {
      type: "analysis"
      evaluation: InterviewAnswerEvaluation
      scores: InterviewLiveScores
      question_id: number
    }
  | {
      type: "interview_complete"
      scores: InterviewLiveScores
    }
