'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot, SendHorizonal, Sparkles, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Message = { role: 'user' | 'assistant'; content: string };
type ChatHistoryItem = Pick<Message, 'role' | 'content'>;

const CHAT_STORAGE_KEY = 'fixgenie-fixbot-chat-v1';
const QUICK_PROMPTS = [
  'My AC is not cooling in room 305. What should I check first?',
  'There is water leaking from the ceiling near the lab entrance.',
  'The Wi-Fi is down on the second floor. How should this be triaged?',
  'Help me explain this issue clearly before I create a ticket.',
];

export default function ChatClient() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const prefill = useMemo(
    () => (searchParams.get('prefill') ?? '').trim(),
    [searchParams],
  );

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed)) {
          setMessages(
            parsed.filter(
              (item): item is Message =>
                !!item &&
                (item.role === 'user' || item.role === 'assistant') &&
                typeof item.content === 'string',
            ),
          );
        }
      }
    } catch {
      window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [hydrated, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!prefill) return;
    setInput((current) => current || prefill);
  }, [prefill]);

  const send = async (seed?: string) => {
    const nextInput = (seed ?? input).trim();
    if (!nextInput || loading) return;

    const history: ChatHistoryItem[] = messages.slice(-6).map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const userMsg: Message = { role: 'user', content: nextInput };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Chat failed. Try again.');
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer ?? 'No response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput(prefill);
    window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
    toast.success('Conversation cleared.');
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col px-4 py-2">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>FixBot – Smart maintenance assistant</CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={clearConversation}
            disabled={messages.length === 0 && !input}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
          {prefill && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Ticket context loaded
              </div>
              <p className="mt-1">
                FixBot can help explain the issue, suggest checks, or prepare next steps from this ticket.
              </p>
            </div>
          )}
          <div className="h-[380px] space-y-3 overflow-y-auto rounded-md border bg-muted/40 p-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Ask things like &quot;My AC is not cooling&quot; or &quot;How long will it take to fix a broken chair?&quot;
                </p>
                <p className="text-xs">
                  The chat now remembers your current browser session and keeps recent context for follow-up questions.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground'
                      : 'max-w-[80%] rounded-xl bg-muted px-3 py-2 text-sm'
                  }
                >
                  {m.role === 'assistant' ? renderAssistantContent(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  FixBot is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your maintenance problem or ask a question..."
              maxLength={1500}
            />
            <Button type="submit" disabled={loading}>
              <SendHorizonal className="mr-1 h-4 w-4" />
              {loading ? 'Sending…' : 'Send'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function renderAssistantContent(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="ml-4 list-disc space-y-1">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`} className="whitespace-pre-wrap">
            {item}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^([-*]|\d+\.)\s+/, ''));
      return;
    }

    flushList();

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="font-semibold">
          {trimmed.slice(4)}
        </h4>,
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="font-semibold">
          {trimmed.slice(3)}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="font-semibold">
          {trimmed.slice(2)}
        </h2>,
      );
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="whitespace-pre-wrap">
        {trimmed}
      </p>,
    );
  });

  flushList();

  return <div className="space-y-2">{elements}</div>;
}

