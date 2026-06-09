import { Sparkles, User } from 'lucide-react';

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
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-walnut text-white' : 'bg-espresso text-white'
        }`}
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-walnut text-white rounded-tr-none'
            : 'bg-white text-espresso shadow-[var(--shadow-card)] rounded-tl-none'
        }`}
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
