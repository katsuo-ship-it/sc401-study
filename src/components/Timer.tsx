'use client';

import { useEffect, useState, useCallback } from 'react';

interface TimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export function Timer({ totalMinutes, onTimeUp, isRunning }: TimerProps) {
  const [remaining, setRemaining] = useState(totalMinutes * 60);

  useEffect(() => {
    setRemaining(totalMinutes * 60);
  }, [totalMinutes]);

  const handleTimeUp = useCallback(() => {
    onTimeUp();
  }, [onTimeUp]);

  useEffect(() => {
    if (!isRunning) return;
    if (remaining <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, remaining, handleTimeUp]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 300;

  return (
    <div
      className={`font-mono text-lg px-4 py-2 rounded-lg ${
        isLow
          ? 'bg-red-900/50 text-red-400 animate-pulse'
          : 'bg-gray-800 text-gray-200'
      }`}
    >
      {hours > 0 && `${hours}:`}
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
