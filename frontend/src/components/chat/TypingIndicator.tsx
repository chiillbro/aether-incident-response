// components/chat/TypingIndicator.tsx
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
    </div>
  );
}