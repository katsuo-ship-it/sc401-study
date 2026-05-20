'use client';

import { useEffect, useState } from 'react';
import { loadProgress, resetProgress } from '@/lib/storage';
import type { StudyProgress } from '@/lib/types';
import { allQuestions } from '@/data';
import { ScoreChart } from '@/components/ScoreChart';

export default function DashboardPage() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null;

  const rate =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

  const recentHistory = [...progress.history].reverse().slice(0, 20);

  const handleReset = () => {
    if (window.confirm('学習データをすべてリセットしますか？この操作は取り消せません。')) {
      const fresh = resetProgress();
      setProgress(fresh);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {progress.totalAnswered}
          </div>
          <div className="text-sm text-gray-400">総回答数</div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-400">{rate}%</div>
          <div className="text-sm text-gray-400">正答率</div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {progress.weakQuestions.length}
          </div>
          <div className="text-sm text-gray-400">苦手問題</div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {progress.bookmarkedQuestions.length}
          </div>
          <div className="text-sm text-gray-400">ブックマーク</div>
        </div>
      </div>

      <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
        <h2 className="text-lg font-bold mb-4">ドメイン別正答率</h2>
        <ScoreChart domainStats={progress.domainStats} />
      </div>

      <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
        <h2 className="text-lg font-bold mb-4">学習カバレッジ</h2>
        <div className="text-sm text-gray-400">
          <p>
            全{allQuestions.length}問中、少なくとも1回解答した問題:
            <span className="text-white font-bold ml-2">
              {new Set(progress.history.map((h) => h.questionId)).size}問
            </span>
          </p>
        </div>
        <div className="mt-2 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{
              width: `${(new Set(progress.history.map((h) => h.questionId)).size / allQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {recentHistory.length > 0 && (
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-lg font-bold mb-4">直近の回答履歴</h2>
          <div className="space-y-1">
            {recentHistory.map((record, i) => {
              const q = allQuestions.find((q) => q.id === record.questionId);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm py-1 border-b border-gray-800 last:border-0"
                >
                  <span
                    className={`w-5 text-center font-bold ${
                      record.isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {record.isCorrect ? 'O' : 'X'}
                  </span>
                  <span className="text-gray-400 truncate flex-1">
                    {q?.question.slice(0, 60) ?? record.questionId}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(record.timestamp).toLocaleString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-900/50 border border-red-700 text-red-400 rounded-lg hover:bg-red-900 text-sm"
        >
          学習データをリセット
        </button>
      </div>
    </div>
  );
}
