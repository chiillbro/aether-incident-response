// 'use client';

// import React from 'react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { SignOutButton } from '@/components/auth/SignOutButton'; // Ensure path is correct
// import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
// import { useSession } from 'next-auth/react';
// import { Role } from '@/types';
// import {
//     PanelLeftClose,
//     PanelRightClose,
//     Settings, // Example Footer Icon
//     Flame, // App Icon Example
// } from 'lucide-react';
// import { SidebarNav } from './SideBarNav';

// interface DashboardSidebarProps {
//     isCollapsed: boolean;
//     setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
// }

// export function DashboardSidebar({ isCollapsed, setIsCollapsed }: DashboardSidebarProps) {
//     const { data: session } = useSession();
//     const userRole = session?.user?.role as Role | undefined;

//     return (
//         <aside
//             className={cn(
//                 `relative hidden h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out md:flex`,
//                 isCollapsed ? 'w-16' : 'w-60' // Adjust widths as needed
//             )}
//         >
//             {/* Top Section: Logo / App Name */}
//             <div className={cn(
//                 "flex h-16 items-center border-b px-4",
//                 isCollapsed ? 'justify-center px-2' : 'justify-start'
//             )}>
//                 <Flame className={`h-6 w-6 text-primary ${isCollapsed ? '' : 'mr-2'}`} />
//                 <span className={cn("font-bold text-lg", isCollapsed ? 'sr-only' : '')}>
//                     Aether
//                 </span>
//             </div>

//             {/* Middle Section: Navigation */}
//             <div className="flex-1 overflow-y-auto py-4">
//                 <SidebarNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} currentRole={userRole} />
//             </div>

//             {/* Bottom Section: Collapse Toggle, Settings, Sign Out */}
//             <div className={cn("mt-auto border-t p-2", isCollapsed ? 'px-1' : 'px-2')}>
//                 {/* Optional Settings Link */}
//                  <TooltipProvider delayDuration={0}>
//                      <Tooltip>
//                          <TooltipTrigger asChild>
//                              <Button variant="ghost" size="icon" className="w-full mb-1 justify-center">
//                                  <Settings className="h-5 w-5" />
//                                  <span className="sr-only">Settings</span>
//                              </Button>
//                          </TooltipTrigger>
//                          <TooltipContent side="right" sideOffset={5}>Settings</TooltipContent>
//                      </Tooltip>
//                  </TooltipProvider>

//                 {/* Collapse Toggle */}
//                 <TooltipProvider delayDuration={0}>
//                     <Tooltip>
//                         <TooltipTrigger asChild>
//                             <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="w-full mb-1 justify-center"
//                                 onClick={() => setIsCollapsed(prev => !prev)}
//                                 aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//                             >
//                                 {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
//                                 <span className="sr-only">{isCollapsed ? 'Expand' : 'Collapse'}</span>
//                             </Button>
//                         </TooltipTrigger>
//                         <TooltipContent side="right" sideOffset={5}>{isCollapsed ? 'Expand' : 'Collapse'}</TooltipContent>
//                     </Tooltip>
//                 </TooltipProvider>

//                 <Separator className="my-1" />

//                 {/* Sign Out */}
//                  <div className={cn("py-1", isCollapsed ? 'flex justify-center' : '')}>
//                      {isCollapsed ? (
//                          <TooltipProvider delayDuration={0}>
//                              <Tooltip>
//                                  <TooltipTrigger asChild>
//                                      <div> {/* Wrap SignOutButton for Tooltip Trigger */}
//                                         <SignOutButton isCollapsed={true} />
//                                      </div>
//                                  </TooltipTrigger>
//                                  <TooltipContent side="right" sideOffset={5}>Sign Out</TooltipContent>
//                              </Tooltip>
//                          </TooltipProvider>
//                      ) : (
//                          <SignOutButton isCollapsed={false} />
//                      )}
//                  </div>
//             </div>
//         </aside>
//     );
// }


// frontend/src/components/layout/DashboardSidebar.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';
import { Role } from '@/types';
import {
    PanelLeftClose,
    PanelRightClose,
    Settings,
    Flame,
} from 'lucide-react';
import { SidebarNav } from './SidebarNav';

interface DashboardSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardSidebar({ isCollapsed, setIsCollapsed }: DashboardSidebarProps) {
    const { data: session } = useSession();
    const userRole = session?.user?.role as Role | undefined;

    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    return (
        // Ensure position is sticky or fixed relative to the viewport if needed
        // For h-screen flex parent, relative should be enough
        <aside
            data-collapsed={isCollapsed} // Add data attribute for potential styling
            className={cn(
                `group relative hidden h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out md:flex overflow-hidden`, // Added 'group' for potential hover effects
                isCollapsed ? 'w-16' : 'w-60'
            )}
        >
            {/* Top Section: Logo / App Name */}
            <div className={cn(
                "flex h-16 shrink-0 items-center border-b px-4", // Added shrink-0
                isCollapsed ? 'justify-center px-2' : 'justify-start'
            )}>
                 {/* Make Logo clickable to toggle sidebar? Optional */}
                 <button onClick={toggleSidebar} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm">
                     <Flame className={`h-6 w-6 text-primary`} />
                     <span className={cn("font-bold text-lg whitespace-nowrap", isCollapsed ? 'sr-only' : '')}>
                         Aether
                     </span>
                 </button>
            </div>

            {/* Middle Section: Navigation + Clickable Empty Space */}
            {/* This div will grow and be clickable */}
            <div
                 className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden cursor-pointer"
                 onClick={toggleSidebar} // Make the growing area clickable
                 role="button" // Indicate interactivity
                 aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                 tabIndex={0} // Make it focusable
                 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSidebar(); }} // Keyboard accessibility
                 title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} // Tooltip for the area
            >
                {/* Wrap SidebarNav in a div that stops click propagation */}
                 <div onClick={(e) => e.stopPropagation()} className='py-4' role="navigation">
                    <SidebarNav
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed} // Pass down if needed by nav items
                        currentRole={userRole}
                    />
                 </div>
                 {/* The remaining space in this flex-1 div is now clickable */}
                 <div className="flex-grow" /> {/* Explicitly define the growing empty space */}
            </div>


            {/* Bottom Section: Collapse Toggle, Settings, Sign Out */}
            {/* Make this non-clickable or stop propagation if needed */}
            <div
                className={cn(
                    "mt-auto shrink-0 border-t p-2", // Added shrink-0
                    isCollapsed ? 'px-1' : 'px-2'
                )}
                onClick={(e) => e.stopPropagation()} // Prevent clicks here bubbling up
             >
                {/* Optional Settings Link */}
                  <TooltipProvider delayDuration={0}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-full mb-1 justify-center">
                                  <Settings className="h-5 w-5" />
                                  <span className="sr-only">Settings</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={5}>Settings</TooltipContent>
                      </Tooltip>
                  </TooltipProvider>

                {/* Collapse Toggle Button (keep this specific button) */}
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full mb-1 justify-center"
                                onClick={toggleSidebar} // Use the toggle function
                                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                                <span className="sr-only">{isCollapsed ? 'Expand' : 'Collapse'}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5}>{isCollapsed ? 'Expand' : 'Collapse'}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Separator className="my-1" />

                {/* Sign Out */}
                 <div className={cn("py-1", isCollapsed ? 'flex justify-center' : '')}>
                    {/* ... (SignOutButton logic with Tooltip) ... */}
                     {isCollapsed ? (
                         <TooltipProvider delayDuration={0}> <Tooltip> <TooltipTrigger asChild>
                            <div><SignOutButton isCollapsed={true} /></div>
                         </TooltipTrigger> <TooltipContent side="right" sideOffset={5}>Sign Out</TooltipContent> </Tooltip> </TooltipProvider>
                     ) : ( <SignOutButton isCollapsed={false} /> )}
                 </div>
            </div>
        </aside>
    );
}