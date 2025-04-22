import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
   <div className="flex items-center justify-center h-screen font-bold text-2xl text-red-500">
    <Button>
      <Link href="/dashboard">
        Go to Dashboard
      </Link>
    </Button>
   </div>
  );
}
