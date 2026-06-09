const QUESTIONS = [
  'Proč klesají návštěvy?',
  'Jak snížit PNO?',
  'Shrň výkon za posledních 30 dní.',
  'Co zlepšit jako první?',
];

interface Props {
  onSelect: (question: string) => void;
  disabled: boolean;
}

export default function QuickQuestions({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="rounded-pill border border-clay-soft bg-white px-4 py-2 text-xs font-medium text-espresso hover:border-walnut hover:text-walnut transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
