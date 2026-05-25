'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { allQuestions } from '@/data';
import { shuffleArray } from '@/lib/shuffle';
import { recordAnswer, toggleBookmark, loadProgress } from '@/lib/storage';
import type { Question, StudyProgress } from '@/lib/types';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';

type ReviewMode = 'weak' | 'bookmarked';

export default function ReviewPage() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [mode, setMode] = useState<ReviewMode>('weak');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const weakQuestions = useMemo(
    () => allQuestions.filter((q) => progress?.weakQuestions.includes(q.id)),
    [progress],
  );

  const bookmarkedQuestions = useMemo(
    () => allQuestions.filter((q) => progress?.bookmarkedQuestions.includes(q.id)),
    [progress],
  );

  const targetQuestions = mode === 'weak' ? weakQuestions : bookmarkedQuestions;

  const startReview = useCallback(() => {
    setQuestions(shuffleArray(targetQuestions));
    setCurrentIndex(0);
    setStarted(true);
  }, [targetQuestions]);

  const handleAnswer = useCallback(
    (isCorrect: boolean, selectedAnswers: number[]) => {
      const q = questions[currentIndex];
      const updated = recordAnswer(q.id, q.domain, selectedAnswers, isCorrect);
      setProgress(updated);
    },
    [questions, currentIndex],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const handleToggleBookmark = useCallback(() => {
    const q = questions[currentIndex];
    const updated = toggleBookmark(q.id);
    setProgress(updated);
  }, [questions, currentIndex]);

  if (!started) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">復習</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('weak')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'weak'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            苦手問題 ({weakQuestions.length})
          </button>
          <button
            onClick={() => setMode('bookmarked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'bookmarked'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ブックマーク ({bookmarkedQuestions.length})
          </button>
        </div>

        {targetQuestions.length === 0 ? (
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400">
              {mode === 'weak'
                ? '苦手問題はありません。学習を続けると、間違えた問題がここに表示されます。'
                : 'ブックマークした問題はありません。学習中に気になる問題をブックマークしてください。'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              {targetQuestions.length}問を復習できます。
            </p>
            <button
              onClick={startReview}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              復習を開始
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentIndex >= questions.length) {
    return (
      <div className="space-y-6 text-center py-12">
        <h2 className="text-2xl font-bold">復習完了!</h2>
        <button
          onClick={() => setStarted(false)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          戻る
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {mode === 'weak' ? '苦手問題の復習' : 'ブックマーク復習'}
        </h1>
        <button
          onClick={() => setStarted(false)}
          className="text-sm text-gray-400 hover:text-white"
        >
          終了
        </button>
      </div>
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        index={currentIndex}
        total={questions.length}
        isBookmarked={progress?.bookmarkedQuestions.includes(currentQuestion.id) ?? false}
        onToggleBookmark={handleToggleBookmark}
        onAnswer={handleAnswer}
        onNext={handleNext}
        showExplanationImmediately={true}
      />
    </div>
  );
}
