// frontend/src/components/layout/MobileHeader.tsx
'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils'; // Assuming getInitials is moved to utils

export function MobileHeader() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden"> {/* Hidden on medium and up */}
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-md">
                <Flame className="h-5 w-5 text-primary" />
                <span>Aether</span>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Avatar className="h-8 w-8 cursor-pointer border">
                        {/* Add session?.user?.image if available */}
                        <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Add settings link later */}
                    {/* <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}