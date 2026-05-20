'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadProgress } from '@/lib/storage';
import type { StudyProgress } from '@/lib/types';
import { ScoreChart } from '@/components/ScoreChart';

export default function HomePage() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const rate =
    progress && progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SC-401
          </span>
          <span className="ml-4">模擬試験</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Microsoft Certified: Information Security Administrator Associate (SC-401)
          試験合格を目指すための実践的な学習プラットフォーム
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link
          href="/study"
          className="group p-8 bg-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all shadow-xl hover:shadow-blue-900/20"
        >
          <div className="h-12 w-12 bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">学習モード</h2>
          <p className="text-gray-400">1問ずつ解答し、その場で解説を確認。ドメイン別フィルタや苦手問題の復習が可能です。</p>
        </Link>

        <Link
          href="/exam"
          className="group p-8 bg-gray-800 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all shadow-xl hover:shadow-purple-900/20"
        >
          <div className="h-12 w-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">模擬試験</h2>
          <p className="text-gray-400">本番同様の制限時間付き（100分）。全問解答後にまとめて結果と解説を確認できます。</p>
        </Link>

        <Link
          href="/review"
          className="group p-8 bg-gray-800 rounded-2xl border border-gray-700 hover:border-amber-500 transition-all shadow-xl hover:shadow-amber-900/20"
        >
          <div className="h-12 w-12 bg-amber-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">復習 / ブックマーク</h2>
          <p className="text-gray-400">苦手問題やブックマークした問題を集中的に復習できます。</p>
        </Link>

        <Link
          href="/dashboard"
          className="group p-8 bg-gray-800 rounded-2xl border border-gray-700 hover:border-emerald-500 transition-all shadow-xl hover:shadow-emerald-900/20"
        >
          <div className="h-12 w-12 bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">ダッシュボード</h2>
          <p className="text-gray-400">ドメイン別の正答率や学習進捗をグラフで確認できます。</p>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-blue-900/10 rounded-2xl border border-blue-900/30">
        <h3 className="text-xl font-bold mb-2 text-blue-300">SC-401 試験範囲</h3>
        <p className="text-xs text-gray-500 mb-4">2026年4月27日改訂版</p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            情報保護の実装 (30〜35%)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            DLP・保持の実装 (30〜35%)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            リスク・アラート・アクティビティの管理 (30〜35%)
          </li>
        </ul>
      </div>

      {progress && progress.totalAnswered > 0 && (
        <div className="max-w-4xl mx-auto p-8 bg-gray-900/50 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-300">学習進捗</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{progress.totalAnswered}</div>
              <div className="text-sm text-gray-400">回答数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{rate}%</div>
              <div className="text-sm text-gray-400">正答率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{progress.weakQuestions.length}</div>
              <div className="text-sm text-gray-400">苦手問題</div>
            </div>
          </div>
          <ScoreChart domainStats={progress.domainStats} />
        </div>
      )}
    </div>
  );
}
