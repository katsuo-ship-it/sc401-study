interface ExplanationCardProps {
  explanation: string;
  isCorrect: boolean;
}

export function ExplanationCard({ explanation, isCorrect }: ExplanationCardProps) {
  return (
    <div
      className={`mt-4 p-4 rounded-lg border-l-4 ${
        isCorrect
          ? 'bg-green-900/20 border-green-500 text-green-200'
          : 'bg-red-900/20 border-red-500 text-red-200'
      }`}
    >
      <div className="font-bold mb-2">
        {isCorrect ? '正解!' : '不正解'}
      </div>
      <p className="text-gray-200 leading-relaxed">{explanation}</p>
    </div>
  );
}
