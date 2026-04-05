import { UserShell } from '@/components/app-shell/user-shell';
import ChatClient from './chat-client';

export default function ChatPage() {
  return (
    <UserShell active="chat">
      <ChatClient />
    </UserShell>
  );
}

