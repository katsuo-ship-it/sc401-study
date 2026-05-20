'use client';

import type { AnswerRecord, Domain, StudyProgress } from './types';

const STORAGE_KEY = 'sc401-study-progress';

function getDefaultProgress(): StudyProgress {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    domainStats: {
      protect: { answered: 0, correct: 0 },
      dlp: { answered: 0, correct: 0 },
      risk: { answered: 0, correct: 0 },
    },
    weakQuestions: [],
    bookmarkedQuestions: [],
    history: [],
  };
}

export function loadProgress(): StudyProgress {
  if (typeof window === 'undefined') return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw) as StudyProgress;
    if (!parsed.domainStats || !('protect' in parsed.domainStats)) {
      return getDefaultProgress();
    }
    return parsed;
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: StudyProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordAnswer(
  questionId: string,
  domain: Domain,
  selectedAnswers: number[],
  isCorrect: boolean,
): StudyProgress {
  const progress = loadProgress();
  const record: AnswerRecord = {
    questionId,
    selectedAnswers,
    isCorrect,
    timestamp: Date.now(),
  };

  progress.totalAnswered++;
  if (isCorrect) progress.totalCorrect++;

  progress.domainStats[domain].answered++;
  if (isCorrect) progress.domainStats[domain].correct++;

  if (!isCorrect && !progress.weakQuestions.includes(questionId)) {
    progress.weakQuestions.push(questionId);
  }
  if (isCorrect) {
    progress.weakQuestions = progress.weakQuestions.filter((id) => id !== questionId);
  }

  progress.history.push(record);

  saveProgress(progress);
  return progress;
}

export function toggleBookmark(questionId: string): StudyProgress {
  const progress = loadProgress();
  const idx = progress.bookmarkedQuestions.indexOf(questionId);
  if (idx >= 0) {
    progress.bookmarkedQuestions.splice(idx, 1);
  } else {
    progress.bookmarkedQuestions.push(questionId);
  }
  saveProgress(progress);
  return progress;
}

export function resetProgress(): StudyProgress {
  const fresh = getDefaultProgress();
  saveProgress(fresh);
  return fresh;
}
