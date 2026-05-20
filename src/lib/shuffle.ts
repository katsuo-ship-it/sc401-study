import type { Question } from './types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickQuestions(
  questions: Question[],
  count: number,
  priorityIds?: string[],
): Question[] {
  const priority = priorityIds
    ? questions.filter((q) => priorityIds.includes(q.id))
    : [];
  const rest = questions.filter((q) => !priorityIds?.includes(q.id));

  const shuffledPriority = shuffleArray(priority);
  const shuffledRest = shuffleArray(rest);

  return [...shuffledPriority, ...shuffledRest].slice(0, count);
}
