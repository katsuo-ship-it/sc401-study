'use client';

import { useState } from 'react';

interface OrderingCardProps {
  items: string[];
  selectCount: number;
  disabled: boolean;
  onAnswer: (ordered: string[]) => void;
  correctOrder?: string[];
  showResult: boolean;
}

export function OrderingCard({
  items,
  selectCount,
  disabled,
  onAnswer,
  correctOrder,
  showResult,
}: OrderingCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [shuffledItems] = useState(() =>
    [...items].sort(() => Math.random() - 0.5),
  );

  const handleSelect = (item: string) => {
    if (disabled) return;
    if (selected.includes(item)) {
      setSelected(selected.filter((s) => s !== item));
      return;
    }
    if (selected.length >= selectCount) return;
    const newSelected = [...selected, item];
    setSelected(newSelected);
    if (newSelected.length === selectCount) {
      onAnswer(newSelected);
    }
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    setSelected(selected.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (disabled || index === 0) return;
    const newSelected = [...selected];
    [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
    setSelected(newSelected);
    if (newSelected.length === selectCount) {
      onAnswer(newSelected);
    }
  };

  const handleMoveDown = (index: number) => {
    if (disabled || index === selected.length - 1) return;
    const newSelected = [...selected];
    [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
    setSelected(newSelected);
    if (newSelected.length === selectCount) {
      onAnswer(newSelected);
    }
  };

  const getItemStatus = (item: string, index: number) => {
    if (!showResult || !correctOrder) return '';
    if (correctOrder[index] === item) return 'border-green-500 bg-green-900/20';
    return 'border-red-500 bg-red-900/20';
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        {items.length}つの中から{selectCount}つを選び、正しい順番に並べてください
        （{selected.length}/{selectCount}）
      </p>

      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-300">選択した順序:</p>
          {selected.map((item, index) => (
            <div
              key={item}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                showResult
                  ? getItemStatus(item, index)
                  : 'border-blue-500 bg-blue-900/20'
              }`}
            >
              <span className="text-blue-400 font-bold w-6 text-center">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-gray-200">{item}</span>
              {!disabled && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    title="上に移動"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === selected.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    title="下に移動"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="除外"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-bold text-gray-300">選択肢:</p>
        <div className="grid gap-2">
          {shuffledItems.map((item) => {
            const isSelected = selected.includes(item);
            return (
              <button
                key={item}
                onClick={() => handleSelect(item)}
                disabled={disabled || (isSelected ? false : selected.length >= selectCount)}
                className={`text-left p-3 rounded-lg border transition-all text-sm ${
                  isSelected
                    ? 'border-gray-700 bg-gray-900 text-gray-600 line-through'
                    : selected.length >= selectCount
                      ? 'border-gray-700 bg-gray-900 text-gray-600 cursor-not-allowed'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-400 cursor-pointer'
                } ${disabled ? 'cursor-default' : ''}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {showResult && correctOrder && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-sm font-bold text-gray-300 mb-2">正しい順序:</p>
          {correctOrder.map((item, i) => (
            <p key={item} className="text-sm text-gray-400">
              {i + 1}. {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
