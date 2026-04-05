'use client';

import { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  targetId: string;
};

export function VoiceInputButton({ targetId }: Props) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSupported(Boolean(SpeechRecognition));
  }, []);

  const handleClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const textarea = document.getElementById(
      targetId,
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      textarea.value = `${textarea.value} ${transcript}`.trim();
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    };

    recognition.start();
  };

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={recording ? 'destructive' : 'outline'}
      size="icon"
      onClick={handleClick}
      className="ml-2"
      aria-label="Dictate description"
    >
      {recording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}

