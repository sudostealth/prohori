'use client';

import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

export function ChatBubble({ role, content }: { role: 'user' | 'ai', content: string }) {
  return (
    <div className={cn("flex gap-4 mb-6", role === 'user' ? "flex-row-reverse" : "")}>
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border shrink-0", role === 'ai' ? "bg-primary/10 border-primary/50 text-primary" : "bg-surface-2 border-border text-text-muted")}>
        {role === 'ai' ? (
          <Bot className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>

      <div className={cn(
        "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed overflow-hidden",
        role === 'ai'
          ? "bg-surface-2 text-text border border-border rounded-tl-none"
          : "bg-primary text-background font-medium rounded-tr-none"
      )}>
        {role === 'ai' ? (
           <div data-color-mode="dark">
             <MDEditor.Markdown source={content} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
           </div>
        ) : (
           <p>{content}</p>
        )}
      </div>
    </div>
  );
}
