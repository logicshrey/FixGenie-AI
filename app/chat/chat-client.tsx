'use client';

import { useState } from 'react';
import { Bot, SendHorizonal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
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

  return (
    <main className="mx-auto flex max-w-3xl flex-col px-4 py-2">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>FixBot – Smart maintenance assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="h-[380px] space-y-3 overflow-y-auto rounded-md border bg-muted/40 p-3 text-sm">
            {messages.length === 0 && (
              <p className="text-muted-foreground">
                Ask things like &quot;My AC is not cooling&quot; or &quot;How long will it take to fix a broken chair?&quot;
              </p>
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
                  {m.content}
                </div>
              </div>
            ))}
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

