export type Domain = 'protect' | 'dlp' | 'risk';

export type QuestionType = 'single' | 'multi' | 'scenario' | 'matching' | 'ordering' | 'fillblank';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface FillBlankBlank {
  placeholder: string;
  answer: string;
}

export interface Question {
  id: string;
  domain: Domain;
  subdomain: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswers: number[];
  explanation: string;
  scenarioId?: string;
  scenarioText?: string;
  matchingLeft?: string[];
  matchingRight?: string[];
  matchingCorrect?: MatchingPair[];
  orderingItems?: string[];
  orderingSelectCount?: number;
  orderingCorrect?: string[];
  fillBlankTemplate?: string;
  fillBlankBlanks?: FillBlankBlank[];
  fillBlankOptions?: string[];
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  timestamp: number;
}

export interface StudyProgress {
  totalAnswered: number;
  totalCorrect: number;
  domainStats: Record<Domain, { answered: number; correct: number }>;
  weakQuestions: string[];
  bookmarkedQuestions: string[];
  history: AnswerRecord[];
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  protect: '情報保護の実装',
  dlp: 'DLP・保持の実装',
  risk: 'リスク・アラート・アクティビティの管理',
};

export const DOMAIN_WEIGHTS: Record<Domain, { min: number; max: number }> = {
  protect: { min: 30, max: 35 },
  dlp: { min: 30, max: 35 },
  risk: { min: 30, max: 35 },
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  protect: '#0078d4',
  dlp: '#7b2d8b',
  risk: '#c46900',
};

export const EXAM_TIME_MINUTES = 100;
export const EXAM_QUESTION_COUNT = 65;
