// src/components/chat/ScrollToBottom.tsx
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function ScrollToBottom({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bottom-20 right-4">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full shadow-lg animate-bounce"
        onClick={onClick}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
}