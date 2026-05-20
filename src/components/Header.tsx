'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ホーム' },
  { href: '/study', label: '学習モード' },
  { href: '/exam', label: '模擬試験' },
  { href: '/review', label: '復習' },
  { href: '/dashboard', label: 'ダッシュボード' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">
        <Link
          href="/"
          className="text-lg font-bold text-blue-400 mr-6 whitespace-nowrap"
        >
          SC-401 Study
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
