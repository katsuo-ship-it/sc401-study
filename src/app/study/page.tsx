'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { allQuestions } from '@/data';
import { shuffleArray } from '@/lib/shuffle';
import { recordAnswer, toggleBookmark, loadProgress } from '@/lib/storage';
import type { Domain, Question, StudyProgress } from '@/lib/types';
import { QuestionCard } from '@/components/QuestionCard';
import { DomainFilter } from '@/components/DomainFilter';
import { ProgressBar } from '@/components/ProgressBar';

export default function StudyPage() {
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const filteredQuestions = useMemo(
    () =>
      domain === 'all'
        ? allQuestions
        : allQuestions.filter((q) => q.domain === domain),
    [domain],
  );

  const startStudy = useCallback(() => {
    setQuestions(shuffleArray(filteredQuestions));
    setCurrentIndex(0);
    setStarted(true);
  }, [filteredQuestions]);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      const q = questions[currentIndex];
      const updated = recordAnswer(q.id, q.domain, [], isCorrect);
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
        <h1 className="text-2xl font-bold">学習モード</h1>
        <p className="text-gray-400">
          ドメインを選択して学習を開始してください。1問ずつ解答し、その場で解説を確認できます。
        </p>
        <DomainFilter selected={domain} onChange={setDomain} />
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            対象問題数: <span className="text-white font-bold">{filteredQuestions.length}</span>問
          </p>
        </div>
        <button
          onClick={startStudy}
          disabled={filteredQuestions.length === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50"
        >
          学習を開始
        </button>
      </div>
    );
  }

  if (currentIndex >= questions.length) {
    return (
      <div className="space-y-6 text-center py-12">
        <h2 className="text-2xl font-bold">学習完了!</h2>
        <p className="text-gray-400">すべての問題を解答しました。</p>
        <button
          onClick={() => setStarted(false)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          もう一度
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">学習モード</h1>
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
