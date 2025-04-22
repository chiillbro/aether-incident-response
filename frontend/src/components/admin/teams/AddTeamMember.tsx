// // frontend/src/components/admin/teams/AddTeamMember.tsx
// import React, { useState, useMemo } from "react";
// import { useGetUsers } from "@/hooks/api/admin/useGetUsers";
// import { useAddUserToTeam } from "@/hooks/api/admin/useAddUserToTeam";
// import { UserSnippet } from "@/types";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";

// interface AddTeamMemberProps {
//   teamId: string;
//   currentMembers: UserSnippet[]; // Used to filter out existing members
// }

// export function AddTeamMember({ teamId, currentMembers }: AddTeamMemberProps) {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isComboboxOpen, setIsComboboxOpen] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

//   const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useGetUsers();
//   const { mutate: addUser, isPending: isAddingUser } = useAddUserToTeam();

//   // Filter out users already in the team
//   const availableUsers = useMemo(() => {
//     if (!allUsers) return [];
//     const currentMemberIds = new Set(currentMembers.map(m => m.id));
//     return allUsers.filter(user => !currentMemberIds.has(user.id));
//   }, [allUsers, currentMembers]);

//   const selectedUserName = useMemo(() => {
//       return allUsers?.find(user => user.id === selectedUserId)?.name ?? "Select user...";
//   }, [selectedUserId, allUsers])

//   const handleAddUser = () => {
//     if (!selectedUserId) {
//       //  toast({ variant: "destructive", title: "No user selected." });
//       toast.error("No user selected.");
//        return;
//     }
//     addUser({ teamId, userId: selectedUserId }, {
//         onSuccess: () => {
//             // toast({ title: "User added successfully." });
//             toast.success("User added successfully.");
//             setSelectedUserId(null); // Reset selection
//             setIsDialogOpen(false); // Close dialog
//         },
//         onError: (error) => {
//             // Toast shown by hook, just log here if needed
//             console.error("Add user error:", error);
//         }
//     });
//   };

//   return (
//     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//       <DialogTrigger asChild>
//         <Button size="sm">
//           <UserPlus className="mr-2 h-4 w-4" /> Add Member
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Add Member to Team</DialogTitle>
//           <DialogDescription>Select a user to add to this team.</DialogDescription>
//         </DialogHeader>
//         <div className="py-4">
//           {isLoadingUsers && <p className="text-sm text-muted-foreground">Loading users...</p>}
//           {usersError && <p className="text-sm text-destructive">Error loading users: {usersError.message}</p>}
//           {!isLoadingUsers && !usersError && (
//              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={isComboboxOpen}
//                     className="w-full justify-between"
//                   >
//                     {selectedUserName}
//                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
//                   <Command>
//                     <CommandInput placeholder="Search users..." />
//                     <CommandList>
//                         <CommandEmpty>No users found.</CommandEmpty>
//                         <CommandGroup>
//                         {availableUsers.length === 0 && !isLoadingUsers && (
//                              <CommandItem disabled>All users are already in this team.</CommandItem>
//                         )}
//                         {availableUsers.map((user) => (
//                             <CommandItem
//                             key={user.id}
//                             value={user.name ?? user.email} // Value used for searching
//                             onSelect={() => {
//                                 setSelectedUserId(user.id);
//                                 setIsComboboxOpen(false);
//                             }}
//                             >
//                             <Check
//                                 className={cn(
//                                 "mr-2 h-4 w-4",
//                                 selectedUserId === user.id ? "opacity-100" : "opacity-0"
//                                 )}
//                             />
//                             <div>
//                                 <p className="text-sm font-medium">{user.name}</p>
//                                 <p className="text-xs text-muted-foreground">{user.email}</p>
//                             </div>
//                             </CommandItem>
//                         ))}
//                         </CommandGroup>
//                     </CommandList>
//                   </Command>
//                 </PopoverContent>
//               </Popover>
//           )}
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAddingUser}>Cancel</Button>
//           <Button onClick={handleAddUser} disabled={!selectedUserId || isAddingUser}>
//              {isAddingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Add User
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


// frontend/src/components/admin/teams/AddTeamMember.tsx
import React, { useState, useMemo } from "react";
import { useGetUsers } from "@/hooks/api/admin/useGetUsers"; // Fetch available users
import { useAddUserToTeam } from "@/hooks/api/admin/useAddUserToTeam"; // Add user mutation
import { UserSnippet } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AddTeamMemberProps {
  teamId: string;
  currentMembers: UserSnippet[]; // Used to filter out users already in the team
}

export function AddTeamMember({ teamId, currentMembers }: AddTeamMemberProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // For Combobox input

  // Fetch all users (potential optimization needed for large numbers)
  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useGetUsers();

  // Mutation hook
  const { mutate: addUser, isPending: isAddingUser } = useAddUserToTeam();

  // Filter users who are not already members of the current team
  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    const currentMemberIds = new Set(currentMembers.map(m => m.id));
    // Further filter based on search query for Combobox filtering
    return allUsers.filter(user =>
        !currentMemberIds.has(user.id) &&
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allUsers, currentMembers, searchQuery]);

  const selectedUserName = useMemo(() => {
      return allUsers?.find(user => user.id === selectedUserId)?.name ?? "Select user...";
  }, [selectedUserId, allUsers])

  const handleAddUser = () => {
    if (!selectedUserId) {
      toast.error("No user selected.");
       return;
    }
    addUser({ teamId, userId: selectedUserId }, {
        onSuccess: (addedUser) => {
            // toast.success(`${addedUser.name} successfully added.`);
            setSelectedUserId(null); // Reset selection
            setSearchQuery(''); // Reset search
            setIsDialogOpen(false); // Close dialog
        },
        onError: (error) => {
            // Toast shown by hook, log here
            console.error("Add user error:", error);
        }
    });
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
          setSelectedUserId(null);
          setSearchQuery('');
          setIsComboboxOpen(false); // Close combobox too
      }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {/* Button to open the dialog */}
        <Button size="sm" variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Member to Team</AlertDialogTitle>
          <AlertDialogDescription>Select a user to add to this team.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          {isLoadingUsers && (
              <div className="flex items-center space-x-2">
                  <Skeleton className="h-9 w-full" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
          )}
          {usersError && <p className="text-sm text-destructive">Error loading users: {usersError.message}</p>}
          {!isLoadingUsers && !usersError && (
             <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isComboboxOpen}
                    className="w-full justify-between font-normal"
                  >
                     <span className="truncate"> {selectedUserName} </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[250px] p-0">
                  <Command shouldFilter={false}> 
                    <CommandInput
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {availableUsers.length === 0 && searchQuery && (
                             <CommandEmpty>No users found matching "{searchQuery}".</CommandEmpty>
                        )}
                         {availableUsers.length === 0 && !searchQuery && (
                             <CommandEmpty>All users are already members or no users available.</CommandEmpty>
                         )}
                        <CommandGroup>
                        {availableUsers.map((user) => (
                            <CommandItem
                                key={user.id}
                                value={`${user.name} ${user.email}`}
                                onSelect={() => {
                                    setSelectedUserId(user.id);
                                    setIsComboboxOpen(false);
                                    setSearchQuery('');
                                }}
                            >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div>
                                    <p className="text-sm">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
          )}
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isAddingUser}>Cancel</Button>
          <Button onClick={handleAddUser} disabled={!selectedUserId || isAddingUser}>
             {isAddingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Selected User
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}