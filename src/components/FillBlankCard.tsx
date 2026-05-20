'use client';

import { useState } from 'react';

interface FillBlankBlank {
  placeholder: string;
  answer: string;
}

interface FillBlankCardProps {
  template: string;
  blanks: FillBlankBlank[];
  options: string[];
  disabled: boolean;
  onAnswer: (answers: Record<string, string>) => void;
  showResult: boolean;
}

export function FillBlankCard({
  template,
  blanks,
  options,
  disabled,
  onAnswer,
  showResult,
}: FillBlankCardProps) {
  const [dropped, setDropped] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);

  const usedOptions = Object.values(dropped);
  const availableOptions = options.filter((o) => !usedOptions.includes(o));

  const handleDragStart = (value: string) => {
    setDragging(value);
  };

  const handleDropOnBlank = (placeholder: string) => {
    if (!dragging || disabled) return;
    setDropped((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === dragging) delete next[key];
      }
      next[placeholder] = dragging;
      return next;
    });
    setDragging(null);
  };

  const handleDropOnPool = () => {
    if (!dragging || disabled) return;
    setDropped((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === dragging) delete next[key];
      }
      return next;
    });
    setDragging(null);
  };

  const handleRemoveFromBlank = (placeholder: string) => {
    if (disabled) return;
    setDropped((prev) => {
      const next = { ...prev };
      delete next[placeholder];
      return next;
    });
  };

  const handleSubmit = () => {
    onAnswer(dropped);
  };

  const isBlankCorrect = (blank: FillBlankBlank) => {
    return (dropped[blank.placeholder] ?? '') === blank.answer;
  };

  const parsedParts: (string | { placeholder: string })[] = [];
  let remaining = template;
  for (const blank of blanks) {
    const idx = remaining.indexOf(blank.placeholder);
    if (idx >= 0) {
      if (idx > 0) parsedParts.push(remaining.slice(0, idx));
      parsedParts.push({ placeholder: blank.placeholder });
      remaining = remaining.slice(idx + blank.placeholder.length);
    }
  }
  if (remaining) parsedParts.push(remaining);

  const allFilled = blanks.every((b) => dropped[b.placeholder] !== undefined);

  return (
    <div className="space-y-6">
      <div className="text-base leading-relaxed text-gray-100 bg-gray-900 rounded-lg p-4">
        {parsedParts.map((part, i) => {
          if (typeof part === 'string') {
            return <span key={i}>{part}</span>;
          }
          const blank = blanks.find((b) => b.placeholder === part.placeholder)!;
          const value = dropped[blank.placeholder];
          const isCorrect = showResult ? isBlankCorrect(blank) : null;
          return (
            <span
              key={i}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={() => handleDropOnBlank(blank.placeholder)}
              onClick={() => handleRemoveFromBlank(blank.placeholder)}
              className={`inline-flex items-center justify-center min-w-[120px] px-3 py-0.5 mx-1 my-0.5 rounded border-2 border-dashed text-sm font-medium cursor-pointer transition-colors ${
                value
                  ? isCorrect === null
                    ? 'border-blue-400 bg-blue-900/30 text-blue-200'
                    : isCorrect
                    ? 'border-green-500 bg-green-900/30 text-green-300'
                    : 'border-red-500 bg-red-900/30 text-red-300'
                  : 'border-gray-500 bg-gray-800/50 text-gray-500'
              }`}
            >
              {value ?? blank.placeholder}
            </span>
          );
        })}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnPool}
        className="min-h-[60px] p-4 bg-gray-800 rounded-lg border border-gray-600"
      >
        <p className="text-xs text-gray-500 mb-2">選択肢（ドラッグして空欄へ）</p>
        <div className="flex flex-wrap gap-2">
          {availableOptions.map((opt) => (
            <span
              key={opt}
              draggable={!disabled}
              onDragStart={() => handleDragStart(opt)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-all select-none ${
                disabled
                  ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-default'
                  : 'border-blue-500 bg-blue-900/40 text-blue-200 cursor-grab active:cursor-grabbing hover:bg-blue-800/60'
              }`}
            >
              {opt}
            </span>
          ))}
          {availableOptions.length === 0 && !showResult && (
            <span className="text-xs text-gray-500">すべての選択肢を配置しました</span>
          )}
        </div>
      </div>

      {!disabled && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          回答する
        </button>
      )}

      {showResult && (
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-sm font-bold text-gray-300 mb-2">正解:</p>
          {blanks.map((blank) => (
            <p key={blank.placeholder} className="text-sm text-gray-400">
              {blank.placeholder}: <span className="text-green-400">{blank.answer}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
