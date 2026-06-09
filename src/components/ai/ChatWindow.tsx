'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizonal } from 'lucide-react';
import MessageBubble, { type Message } from './MessageBubble';
import QuickQuestions from './QuickQuestions';

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Dobrý den! Jsem váš AI marketingový analytik pro mionelo.cz. Mohu vám pomoci analyzovat výkon, identifikovat problémy a navrhnout konkrétní kroky. Na co se chcete zeptat?',
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json() as { answer?: string; error?: string };
      const content = data.answer ?? data.error ?? 'Omlouváme se, nastala chyba.';
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Omlouváme se, analytik momentálně není dostupný.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[800px]">
      {/* Quick questions */}
      <QuickQuestions onSelect={sendMessage} disabled={loading} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-espresso text-white flex items-center justify-center shrink-0">
              <span className="text-xs">AI</span>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-[var(--shadow-card)] flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-espresso/30 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-4 border-t border-clay-soft"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napište svůj dotaz…"
          maxLength={500}
          disabled={loading}
          aria-label="Dotaz pro AI analytika"
          className="flex-1 rounded-pill border border-clay-soft bg-white px-5 py-3 text-sm text-espresso placeholder:text-espresso/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Odeslat dotaz"
          className="w-12 h-12 rounded-full bg-walnut text-white flex items-center justify-center hover:bg-walnut/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
        >
          <SendHorizonal size={18} />
        </button>
      </form>
    </div>
  );
}
