import { protectQuestions } from './questions-protect';
import { dlpQuestions } from './questions-dlp';
import { riskQuestions } from './questions-risk';
import type { Domain, Question } from '@/lib/types';

export const allQuestions: Question[] = [
  ...protectQuestions,
  ...dlpQuestions,
  ...riskQuestions,
];

export function getQuestionsByDomain(domain: Domain): Question[] {
  return allQuestions.filter((q) => q.domain === domain);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export { protectQuestions, dlpQuestions, riskQuestions };
