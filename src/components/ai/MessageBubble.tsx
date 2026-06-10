export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'ml-auto flex-row-reverse' : 'flex-row'}`} style={{ maxWidth: 'min(85%, 580px)' }}>
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] font-heading text-[13px] font-bold text-white"
        style={{
          background: isUser
            ? 'var(--color-espresso)'
            : 'linear-gradient(150deg,#6FA46B,#467045)',
        }}
      >
        {isUser ? 'Vy' : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v3M7 8h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9.5" cy="13" r="1.3" fill="#fff"/>
            <circle cx="14.5" cy="13" r="1.3" fill="#fff"/>
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`rounded-2xl px-4.5 py-3.75 text-[15px] leading-[1.6] ${
          isUser
            ? 'rounded-tr-[5px] text-white'
            : 'rounded-tl-[5px] border border-clay-soft bg-white text-espresso shadow-(--shadow-card)'
        }`}
        style={isUser ? { background: 'var(--color-walnut)' } : undefined}
      >
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
