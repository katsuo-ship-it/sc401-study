'use client';

import { useState } from 'react';

interface MatchingCardProps {
  leftItems: string[];
  rightItems: string[];
  disabled: boolean;
  onAnswer: (matches: Record<string, string>) => void;
  correctMatches?: Record<string, string>;
  showResult: boolean;
}

export function MatchingCard({
  leftItems,
  rightItems,
  disabled,
  onAnswer,
  correctMatches,
  showResult,
}: MatchingCardProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shuffledRight] = useState(() =>
    [...rightItems].sort(() => Math.random() - 0.5),
  );

  const handleLeftClick = (item: string) => {
    if (disabled) return;
    setSelectedLeft(selectedLeft === item ? null : item);
  };

  const handleRightClick = (item: string) => {
    if (disabled || !selectedLeft) return;
    const newMatches = { ...matches, [selectedLeft]: item };
    setMatches(newMatches);
    setSelectedLeft(null);
    if (Object.keys(newMatches).length === leftItems.length) {
      onAnswer(newMatches);
    }
  };

  const removeMatch = (left: string) => {
    if (disabled) return;
    const newMatches = { ...matches };
    delete newMatches[left];
    setMatches(newMatches);
  };

  const getMatchedRight = (left: string) => matches[left];
  const isRightUsed = (right: string) => Object.values(matches).includes(right);

  const getMatchColor = (left: string) => {
    if (!showResult || !correctMatches) return 'border-blue-500 bg-blue-900/20';
    return correctMatches[left] === matches[left]
      ? 'border-green-500 bg-green-900/20'
      : 'border-red-500 bg-red-900/20';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          {leftItems.map((item) => {
            const matched = getMatchedRight(item);
            return (
              <div key={item} className="space-y-1">
                <button
                  onClick={() => matched ? removeMatch(item) : handleLeftClick(item)}
                  disabled={disabled}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                    selectedLeft === item
                      ? 'border-blue-400 bg-blue-900/30 text-blue-200'
                      : matched
                        ? `${getMatchColor(item)} text-gray-200`
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400'
                  } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {item}
                </button>
                {matched && (
                  <div className={`ml-4 p-2 rounded text-xs ${getMatchColor(item)} border`}>
                    → {matched}
                    {!disabled && (
                      <button
                        onClick={() => removeMatch(item)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {shuffledRight.map((item) => {
            const used = isRightUsed(item);
            return (
              <button
                key={item}
                onClick={() => handleRightClick(item)}
                disabled={disabled || used || !selectedLeft}
                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                  used
                    ? 'border-gray-700 bg-gray-900 text-gray-600'
                    : selectedLeft
                      ? 'border-gray-500 bg-gray-800 text-gray-300 hover:border-blue-400 hover:bg-blue-900/20 cursor-pointer'
                      : 'border-gray-600 bg-gray-800 text-gray-300'
                } ${disabled ? 'cursor-default' : ''}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {!disabled && selectedLeft && (
        <p className="text-sm text-blue-400">
          「{selectedLeft}」に対応する項目を右側から選んでください
        </p>
      )}

      {showResult && correctMatches && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-sm font-bold text-gray-300 mb-2">正しい組み合わせ:</p>
          {leftItems.map((left) => (
            <p key={left} className="text-sm text-gray-400">
              {left} → {correctMatches[left]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
