'use client';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onClick: () => void;
}

export function BookmarkButton({ isBookmarked, onClick }: BookmarkButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isBookmarked
          ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
          : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'
      }`}
      title={isBookmarked ? 'ブックマーク解除' : 'ブックマークに追加'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
