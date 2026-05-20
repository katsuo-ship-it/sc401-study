'use client';

import type { Domain } from '@/lib/types';
import { DOMAIN_LABELS } from '@/lib/types';

interface DomainFilterProps {
  selected: Domain | 'all';
  onChange: (domain: Domain | 'all') => void;
}

const domains: (Domain | 'all')[] = ['all', 'protect', 'dlp', 'risk'];
const labels: Record<Domain | 'all', string> = {
  all: 'すべて',
  ...DOMAIN_LABELS,
};

const colors: Record<Domain | 'all', string> = {
  all: 'bg-gray-600',
  protect: 'bg-blue-600',
  dlp: 'bg-purple-600',
  risk: 'bg-amber-700',
};

export function DomainFilter({ selected, onChange }: DomainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {domains.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === d
              ? `${colors[d]} text-white`
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          {labels[d]}
        </button>
      ))}
    </div>
  );
}
