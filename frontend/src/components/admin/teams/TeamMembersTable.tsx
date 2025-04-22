// frontend/src/components/admin/teams/TeamMembersTable.tsx
import { useState } from 'react';
import { UserSnippet } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2 } from 'lucide-react';
import { useRemoveUserFromTeam } from '@/hooks/api/admin/useRemoveUserFromTeam';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamMembersTableProps {
  teamId: string;
  members: UserSnippet[];
}

export function TeamMembersTable({ teamId, members }: TeamMembersTableProps) {
  const { mutate: removeUser, isPending } = useRemoveUserFromTeam();
  const [userToRemove, setUserToRemove] = useState<UserSnippet | null>(null);

  const handleRemoveClick = (member: UserSnippet) => {
    setUserToRemove(member);
    // The AlertDialogTrigger will open the dialog
  };

  const confirmRemove = () => {
    if (userToRemove) {
      removeUser({ teamId, userId: userToRemove.id }, {
        onSuccess: () => setUserToRemove(null), // Close dialog on success
        onError: () => {/* Toast shown by hook, keep dialog open? Or close? */ setUserToRemove(null); }
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 && (
            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">This team has no members yet.</TableCell></TableRow>
          )}
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
              <TableCell className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-red-100"
                        onClick={() => handleRemoveClick(member)}
                        disabled={isPending && userToRemove?.id === member.id}
                        aria-label={`Remove ${member.name}`}
                    >
                    {isPending && userToRemove?.id === member.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                    }
                    </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

       {/* Confirmation Dialog */}
      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{userToRemove?.name}</strong> ({userToRemove?.email}) from this team?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToRemove(null)} disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmRemove}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
               {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}