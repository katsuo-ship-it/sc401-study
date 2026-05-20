'use client';

import type { Domain } from '@/lib/types';
import { DOMAIN_LABELS, DOMAIN_COLORS } from '@/lib/types';

interface ScoreChartProps {
  domainStats: Record<Domain, { answered: number; correct: number }>;
}

export function ScoreChart({ domainStats }: ScoreChartProps) {
  const domains: Domain[] = ['protect', 'dlp', 'risk'];

  return (
    <div className="space-y-4">
      {domains.map((domain) => {
        const stats = domainStats[domain];
        const rate = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
        return (
          <div key={domain}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{DOMAIN_LABELS[domain]}</span>
              <span className="text-gray-400">
                {stats.correct}/{stats.answered} ({Math.round(rate)}%)
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${rate}%`,
                  backgroundColor: DOMAIN_COLORS[domain],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
