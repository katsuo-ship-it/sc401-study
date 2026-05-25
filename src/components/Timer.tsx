'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export function Timer({ totalMinutes, onTimeUp, isRunning }: TimerProps) {
  const [remaining, setRemaining] = useState(totalMinutes * 60);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setRemaining(totalMinutes * 60);
  }, [totalMinutes]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

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
