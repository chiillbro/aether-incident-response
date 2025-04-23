'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/types'; // Assuming Role enum/type exists
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'; // Import Tooltip
import {
    LayoutDashboard,
    ShieldAlert,
    ListTodo,
    Users,
    Building,
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    roles?: Role[]; // Optional: Roles allowed to see this link (defaults to all authenticated if undefined)
    exact?: boolean; // Match exact path
}

const navItems: NavItem[] = [
    // Common Links
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/incidents', label: 'Incidents', icon: ShieldAlert },
    { href: '/tasks', label: 'My Tasks', icon: ListTodo }, // Add later

    // Admin Links
    { href: '/admin/teams', label: 'Manage Teams', icon: Building, roles: [Role.ADMIN] },
    { href: '/admin/users', label: 'Manage Users', icon: Users, roles: [Role.ADMIN] }, // Add later
    // Add other admin links here
];

interface SidebarNavProps {
    isCollapsed: boolean;
    currentRole?: Role | null;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarNav({ isCollapsed, currentRole, setIsCollapsed }: SidebarNavProps) {
    const pathname = usePathname();

    const filteredNavItems = navItems.filter(item =>
        !item.roles || (currentRole && item.roles.includes(currentRole))
    );

    return (
        <TooltipProvider delayDuration={0}> {/* Wrap with provider */}
            <nav className={`grid gap-1 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                {filteredNavItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    const linkContent = (
                        <>
                            <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3 flex-shrink-0'}`} />
                            <span className={cn(
                                "truncate", // Prevent text wrapping
                                isCollapsed ? 'sr-only' : '' // Hide text visually when collapsed
                            )}>
                                {item.label}
                            </span>
                        </>
                    );

                    const linkElement = (
                         <Link
                             href={item.href}
                             className={cn(
                                 buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }),
                                 'w-full justify-start transition-colors duration-150',
                                 isCollapsed ? 'px-2 justify-center' : '' // Center icon when collapsed
                             )}
                         >
                             {linkContent}
                         </Link>
                    );

                    // Wrap with Tooltip only when collapsed
                    return isCollapsed ? (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                {linkElement}
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={5}>
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                         <div key={item.href}> {/* Use div for key when not using Tooltip */}
                            {linkElement}
                         </div>
                    );
                })}
            </nav>
        </TooltipProvider>
    );
}