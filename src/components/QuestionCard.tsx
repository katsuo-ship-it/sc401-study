'use client';

import { useState, useCallback } from 'react';
import type { Question } from '@/lib/types';
import { DOMAIN_LABELS } from '@/lib/types';
import { checkAnswer, checkMatchingAnswer, checkOrderingAnswer, checkFillBlankAnswer } from '@/lib/scoring';
import { BookmarkButton } from './BookmarkButton';
import { ExplanationCard } from './ExplanationCard';
import { MatchingCard } from './MatchingCard';
import { OrderingCard } from './OrderingCard';
import { FillBlankCard } from './FillBlankCard';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  showExplanationImmediately: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  isBookmarked,
  onToggleBookmark,
  onAnswer,
  onNext,
  showExplanationImmediately,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const submitAnswer = useCallback(
    (correct: boolean) => {
      setAnswered(true);
      setIsCorrect(correct);
      onAnswer(correct);
    },
    [onAnswer],
  );

  const handleOptionClick = (idx: number) => {
    if (answered) return;

    if (question.type === 'single') {
      setSelected([idx]);
      const correct = checkAnswer(question, [idx]);
      submitAnswer(correct);
    } else if (question.type === 'multi') {
      const newSelected = selected.includes(idx)
        ? selected.filter((s) => s !== idx)
        : [...selected, idx];
      setSelected(newSelected);
    }
  };

  const handleMultiSubmit = () => {
    const correct = checkAnswer(question, selected);
    submitAnswer(correct);
  };

  const handleMatchingAnswer = (matches: Record<string, string>) => {
    const correct = checkMatchingAnswer(question, matches);
    submitAnswer(correct);
  };

  const handleOrderingAnswer = (ordered: string[]) => {
    const correct = checkOrderingAnswer(question, ordered);
    submitAnswer(correct);
  };

  const handleFillBlankAnswer = (answers: Record<string, string>) => {
    const correct = checkFillBlankAnswer(question, answers);
    submitAnswer(correct);
  };

  const getOptionClass = (idx: number) => {
    const base = 'w-full text-left p-4 rounded-lg border transition-all text-sm leading-relaxed';
    if (!answered) {
      const isSelected = selected.includes(idx);
      return `${base} ${
        isSelected
          ? 'border-blue-400 bg-blue-900/30 text-blue-200'
          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400 cursor-pointer'
      }`;
    }
    const isCorrectOption = question.correctAnswers.includes(idx);
    const isSelected = selected.includes(idx);
    if (isCorrectOption) return `${base} border-green-500 bg-green-900/20 text-green-200`;
    if (isSelected) return `${base} border-red-500 bg-red-900/20 text-red-200`;
    return `${base} border-gray-700 bg-gray-900 text-gray-500`;
  };

  const typeLabel = {
    single: '単一選択',
    multi: `複数選択（${question.correctAnswers.length}つ）`,
    matching: '組み合わせ',
    ordering: '並べ替え',
    scenario: 'シナリオ',
    fillblank: '空欄補充',
  }[question.type];

  const correctMatchMap = question.matchingCorrect
    ? Object.fromEntries(question.matchingCorrect.map((p) => [p.left, p.right]))
    : undefined;

  return (
    <div className="bg-gray-850 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400">
            Q{index + 1} / {total}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
            {DOMAIN_LABELS[question.domain]}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
            {question.subdomain}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-300">
            {typeLabel}
          </span>
        </div>
        <BookmarkButton isBookmarked={isBookmarked} onClick={onToggleBookmark} />
      </div>

      {question.scenarioText && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600 text-sm text-gray-300 leading-relaxed">
          {question.scenarioText}
        </div>
      )}

      <p className="text-base leading-relaxed mb-6">{question.question}</p>

      {(question.type === 'single' || question.type === 'multi' || question.type === 'scenario') && (
        <div className="space-y-3">
          {question.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={answered}
              className={getOptionClass(idx)}
            >
              {opt}
            </button>
          ))}
          {question.type === 'multi' && !answered && selected.length > 0 && (
            <button
              onClick={handleMultiSubmit}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              回答する（{selected.length}つ選択中）
            </button>
          )}
        </div>
      )}

      {question.type === 'matching' && question.matchingLeft && question.matchingRight && (
        <MatchingCard
          leftItems={question.matchingLeft}
          rightItems={question.matchingRight}
          disabled={answered}
          onAnswer={handleMatchingAnswer}
          correctMatches={correctMatchMap}
          showResult={answered && showExplanationImmediately}
        />
      )}

      {question.type === 'ordering' && question.orderingItems && question.orderingSelectCount && (
        <OrderingCard
          items={question.orderingItems}
          selectCount={question.orderingSelectCount}
          disabled={answered}
          onAnswer={handleOrderingAnswer}
          correctOrder={question.orderingCorrect}
          showResult={answered && showExplanationImmediately}
        />
      )}

      {question.type === 'fillblank' && question.fillBlankTemplate && question.fillBlankBlanks && question.fillBlankOptions && (
        <FillBlankCard
          template={question.fillBlankTemplate}
          blanks={question.fillBlankBlanks}
          options={question.fillBlankOptions}
          disabled={answered}
          onAnswer={handleFillBlankAnswer}
          showResult={answered && showExplanationImmediately}
        />
      )}

      {answered && showExplanationImmediately && (
        <ExplanationCard explanation={question.explanation} isCorrect={isCorrect} />
      )}

      {answered && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            次の問題へ
          </button>
        </div>
      )}
    </div>
  );
}
