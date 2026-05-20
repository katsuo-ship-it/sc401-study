import type { Question } from './types';

export function checkAnswer(question: Question, selected: number[]): boolean {
  if (question.correctAnswers.length !== selected.length) return false;
  const sorted = [...selected].sort();
  const correct = [...question.correctAnswers].sort();
  return sorted.every((v, i) => v === correct[i]);
}

export function checkMatchingAnswer(
  question: Question,
  userMatches: Record<string, string>,
): boolean {
  if (!question.matchingCorrect) return false;
  return question.matchingCorrect.every(
    (pair) => userMatches[pair.left] === pair.right,
  );
}

export function checkOrderingAnswer(
  question: Question,
  userOrder: string[],
): boolean {
  if (!question.orderingCorrect) return false;
  if (userOrder.length !== question.orderingCorrect.length) return false;
  return userOrder.every((item, i) => item === question.orderingCorrect![i]);
}

export function checkFillBlankAnswer(
  question: Question,
  answers: Record<string, string>,
): boolean {
  if (!question.fillBlankBlanks) return false;
  return question.fillBlankBlanks.every(
    (blank) => (answers[blank.placeholder] ?? '') === blank.answer,
  );
}
