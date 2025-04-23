import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

export function ScrollToBottom({ onClick, className }: { onClick: () => void, className?: string }) {
  return (
      <Button
        variant="outline"
        size="icon"
        className={cn("rounded-full shadow-lg animate-bounce cursor-pointer", className)}
        onClick={onClick}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
  );
}
