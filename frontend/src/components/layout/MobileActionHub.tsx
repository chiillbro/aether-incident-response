// frontend/src/components/layout/MobileActionHub.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Role } from '@/types';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
    LayoutDashboard, ShieldAlert, ListTodo, Users, Building, Plus, X, Menu
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    roles?: Role[];
}

// Define items specifically for the mobile hub
const hubNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/incidents', label: 'Incidents', icon: ShieldAlert },
    { href: '/tasks', label: 'My Tasks', icon: ListTodo },
    { href: '/admin/teams', label: 'Teams', icon: Building, roles: [Role.ADMIN] },
    { href: '/admin/users', label: 'Users', icon: Users, roles: [Role.ADMIN] },
];

const FAB_SIZE = 56; // Size of the main button (pixels)
const MENU_ITEM_SIZE = 48; // Size of the menu item buttons
const MENU_RADIUS = 90; // Distance from center of FAB (pixels)
const SPREAD_ANGLE = Math.PI / 2; // Angle over which items spread (90 degrees)
const START_ANGLE = -Math.PI / 2 - (SPREAD_ANGLE / 2); // Start angle (top-left quadrant)

export function MobileActionHub() {
    const { data: session } = useSession();
    const userRole = session?.user?.role as Role | undefined;
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const filteredNavItems = hubNavItems.filter(item =>
        !item.roles || (userRole && item.roles.includes(userRole))
    );

    const numItems = filteredNavItems.length;
    const angleStep = numItems > 1 ? SPREAD_ANGLE / (numItems - 1) : 0;

    const handleNavigation = (href: string) => {
         setIsOpen(false); // Close menu on navigation
         router.push(href); // Navigate
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden"> {/* Hidden on medium and up */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute bottom-0 right-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredNavItems.map((item, index) => {
                            const angle = START_ANGLE + (index * angleStep);
                            const x = Math.round(MENU_RADIUS * Math.cos(angle));
                            const y = Math.round(MENU_RADIUS * Math.sin(angle));

                            return (
                                <motion.div
                                    key={item.href}
                                    className="absolute"
                                    style={{
                                        // Position relative to the bottom-right corner of the parent div
                                        bottom: Math.abs(y) - (MENU_ITEM_SIZE / 2) + (FAB_SIZE / 2),
                                        right: Math.abs(x) - (MENU_ITEM_SIZE / 2) + (FAB_SIZE / 2),
                                    }}
                                    initial={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                                    animate={{ scale: 1, opacity: 1, x: x, y: y }}
                                    exit={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                                    transition={{
                                         type: 'spring',
                                         stiffness: 300,
                                         damping: 15,
                                         delay: index * 0.04 // Stagger animation
                                    }}
                                >
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="secondary" // Or primary/other
                                                    size="icon"
                                                    className="rounded-full shadow-lg h-12 w-12" // Use MENU_ITEM_SIZE
                                                    onClick={() => handleNavigation(item.href)}
                                                    aria-label={item.label}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="left" sideOffset={10}>
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Floating Action Button */}
            <Button
                size="icon"
                className="rounded-full h-14 w-14 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground" // Use FAB_SIZE
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={isOpen ? 'close' : 'menu'}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                         {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </motion.div>
                </AnimatePresence>
            </Button>
        </div>
    );
}