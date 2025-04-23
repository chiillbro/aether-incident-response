// frontend/src/components/admin/users/UserDetailFlyout.tsx
import { useState, useEffect } from 'react';
import { UserSnippet, Role, TeamSnippet as Team } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetTeams } from '@/hooks/api/admin/useGetTeams';
import { useUpdateUserAdmin } from '@/hooks/api/admin/useUpdateUserAdmin';
import { useDeleteUser } from '@/hooks/api/admin/useDeleteUser';
import { Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserDetailFlyoutProps {
  user: UserSnippet | null; // User to edit, or null if closed
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailFlyout({ user, isOpen, onOpenChange }: UserDetailFlyoutProps) {
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: teams, isLoading: isLoadingTeams } = useGetTeams();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUserAdmin();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  // Reset local state when user prop changes (e.g., opening flyout for different user)
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedTeamId(user.teamId);
    } else {
      // Reset when closed
      setSelectedRole(undefined);
      setSelectedTeamId(undefined);
    }
  }, [user]);

  const handleSaveChanges = () => {
    if (!user) return;
    const changes: { role?: Role, teamId?: string | null } = {};
    let hasChanges = false;

    if (selectedRole !== undefined && selectedRole !== user.role) {
        changes.role = selectedRole;
        hasChanges = true;
    }
    if (selectedTeamId !== undefined && selectedTeamId !== user.teamId) {
        changes.teamId = selectedTeamId; // Allows setting null
        hasChanges = true;
    }

    if (!hasChanges) {
        toast.info('No changes detected.');
        // toast({ variant: 'default', title: 'No changes detected.' });
        return;
    }

    updateUser({ userId: user.id, ...changes }, {
        onSuccess: () => {
            // Toast shown by hook
            onOpenChange(false); // Close flyout on success
        },
        onError: () => { /* Toast shown by hook */ }
    });
  };

  const handleDeleteUser = () => {
      if (!user) return;
      deleteUser(user.id, {
          onSuccess: () => {
              setIsDeleteDialogOpen(false); // Close confirmation
              onOpenChange(false); // Close flyout
          },
          onError: () => {
              setIsDeleteDialogOpen(false); // Close confirmation even on error
          }
      })
  }

  if (!user) return null; // Don't render if no user selected

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit User: {user.name}</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto py-4 px-6 space-y-4"> {/* Added padding-right */}
          {/* Role Selection */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as Role)}
              disabled={isUpdating}
            >
              <SelectTrigger id="role" className="col-span-2">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Assignment */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="team" className="text-right">Team</Label>
            <Select
              value={selectedTeamId ?? 'unassigned'} // Use special value for null
              onValueChange={(value) => setSelectedTeamId(value === 'unassigned' ? null : value)}
              disabled={isUpdating || isLoadingTeams}
            >
              <SelectTrigger id="team" className="col-span-2">
                <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select team"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add other editable fields here if needed */}

        </div>
        <SheetFooter className='mt-auto pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2'>
           {/* Delete Button - Opens Confirmation */}
           {/* <AlertDialogTrigger asChild> */}
              <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" size="sm" className='order-last sm:order-first' disabled={isUpdating || isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete User
              </Button>
            {/* </AlertDialogTrigger> */}
            {/* Save/Close Buttons */}
           <div className='flex gap-2 justify-end'>
              <SheetClose asChild>
                  <Button type="button" variant="outline" disabled={isUpdating}>Cancel</Button>
              </SheetClose>
              <Button type="button" onClick={handleSaveChanges} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
           </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    {/* Delete Confirmation Dialog */}
     <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete user <strong>{user.name}</strong> ({user.email})? This action cannot be undone and might affect associated records (like task assignments).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
                <Button disabled={isDeleting} variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
            >
               {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     </>
  );
}