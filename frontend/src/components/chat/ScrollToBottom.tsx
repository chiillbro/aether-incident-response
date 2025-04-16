import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function ScrollToBottom({ onClick }: { onClick: () => void }) {
  return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full shadow-lg animate-bounce cursor-pointer"
        onClick={onClick}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
  );
}
