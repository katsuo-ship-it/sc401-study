'use client';

import { useCallback, useEffect, useState } from 'react';
import { allQuestions } from '@/data';
import { pickQuestions } from '@/lib/shuffle';
import { recordAnswer, toggleBookmark, loadProgress } from '@/lib/storage';
import type { Question, StudyProgress } from '@/lib/types';
import { EXAM_TIME_MINUTES, EXAM_QUESTION_COUNT, EXAM_PASS_SCORE, DOMAIN_LABELS } from '@/lib/types';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationCard } from '@/components/ExplanationCard';
import { Timer } from '@/components/Timer';
import { ProgressBar } from '@/components/ProgressBar';

type ExamPhase = 'setup' | 'running' | 'review';

interface ExamAnswer {
  questionId: string;
  isCorrect: boolean;
}

export default function ExamPage() {
  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const startExam = useCallback(() => {
    const count = Math.min(EXAM_QUESTION_COUNT, allQuestions.length);
    const picked = pickQuestions(allQuestions, count);
    setQuestions(picked);
    setCurrentIndex(0);
    setAnswers([]);
    setPhase('running');
    setTimerRunning(true);
  }, []);

  const handleAnswer = useCallback(
    (isCorrect: boolean, selectedAnswers: number[]) => {
      const q = questions[currentIndex];
      recordAnswer(q.id, q.domain, selectedAnswers, isCorrect);
      setAnswers((prev) => [...prev, { questionId: q.id, isCorrect }]);
    },
    [questions, currentIndex],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setTimerRunning(false);
      setPhase('review');
      setProgress(loadProgress());
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    if (phase !== 'running') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  const handleTimeUp = useCallback(() => {
    setTimerRunning(false);
    setPhase('review');
    setProgress(loadProgress());
  }, []);

  const handleToggleBookmark = useCallback(() => {
    const q = questions[currentIndex];
    const updated = toggleBookmark(q.id);
    setProgress(updated);
  }, [questions, currentIndex]);

  if (phase === 'setup') {
    const examCount = Math.min(EXAM_QUESTION_COUNT, allQuestions.length);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">模擬試験モード</h1>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 space-y-4">
          <h2 className="text-lg font-bold">試験概要</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">問題数:</span>{' '}
              <span className="font-bold">{examCount}問</span>
            </div>
            <div>
              <span className="text-gray-400">制限時間:</span>{' '}
              <span className="font-bold">{EXAM_TIME_MINUTES}分</span>
            </div>
            <div>
              <span className="text-gray-400">合格ライン:</span>{' '}
              <span className="font-bold">{EXAM_PASS_SCORE}/1000点</span>
            </div>
            <div>
              <span className="text-gray-400">解説表示:</span>{' '}
              <span className="font-bold">終了後</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            試験中は解説は表示されません。全問回答後、または制限時間終了後にまとめて確認できます。
          </p>
        </div>
        <button
          onClick={startExam}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold"
        >
          試験を開始
        </button>
      </div>
    );
  }

  if (phase === 'review') {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 1000);
    const passed = score >= EXAM_PASS_SCORE;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">試験結果</h1>
        <div
          className={`p-6 rounded-xl border text-center ${
            passed
              ? 'border-green-500 bg-green-900/20'
              : 'border-red-500 bg-red-900/20'
          }`}
        >
          <div className="text-4xl font-bold mb-2">
            {score} / 1000
          </div>
          <div
            className={`text-xl font-bold ${
              passed ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {passed ? '合格' : '不合格'}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {correctCount} / {questions.length} 問正解 ({Math.round((correctCount / questions.length) * 100)}%)
          </p>
        </div>

        <h2 className="text-xl font-bold">解答の振り返り</h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const isCorrect = answer?.isCorrect ?? false;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg border ${
                  isCorrect
                    ? 'border-green-800 bg-green-900/10'
                    : 'border-red-800 bg-red-900/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm text-gray-400">Q{i + 1}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    {DOMAIN_LABELS[q.domain]}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isCorrect ? '正解' : '不正解'}
                  </span>
                </div>
                <p className="text-sm mb-2">{q.question}</p>
                <ExplanationCard
                  explanation={q.explanation}
                  isCorrect={isCorrect}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setPhase('setup')}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          もう一度受験する
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">模擬試験</h1>
        <Timer
          totalMinutes={EXAM_TIME_MINUTES}
          onTimeUp={handleTimeUp}
          isRunning={timerRunning}
        />
      </div>
      <ProgressBar current={answeredCount} total={questions.length} />
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        index={currentIndex}
        total={questions.length}
        isBookmarked={progress?.bookmarkedQuestions.includes(currentQuestion.id) ?? false}
        onToggleBookmark={handleToggleBookmark}
        onAnswer={handleAnswer}
        onNext={handleNext}
        showExplanationImmediately={false}
      />
    </div>
  );
}
