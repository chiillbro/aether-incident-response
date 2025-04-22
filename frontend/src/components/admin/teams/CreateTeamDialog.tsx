// frontend/src/components/admin/teams/CreateTeamDialog.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTeam } from '@/hooks/api/admin/useCreateTeam'; // Import the hook
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Can be used if triggered by a separate button
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Zod Schema for the form
const createTeamFormSchema = z.object({
  name: z.string().min(2, { message: 'Team name must be at least 2 characters' }).max(100),
});
type CreateTeamFormInput = z.infer<typeof createTeamFormSchema>;

interface CreateTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTeamCreated?: () => void; // Optional callback on success
}

export function CreateTeamDialog({ isOpen, onOpenChange, onTeamCreated }: CreateTeamDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: createTeam, isPending } = useCreateTeam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamFormInput>({
    resolver: zodResolver(createTeamFormSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: CreateTeamFormInput) => {
    setServerError(null);
    createTeam(data, {
      onSuccess: (newTeam) => {
        // toast({
        //   title: "Team Created",
        //   description: `Team "${newTeam.name}" has been created successfully.`,
        // });
        toast.success(`Team "${newTeam.name}" has been created successfully.`);
        reset();
        onTeamCreated?.(); // Call optional callback
        onOpenChange(false); // Close the dialog
      },
      onError: (error) => {
        // toast({
        //   variant: "destructive",
        //   title: "Failed to Create Team",
        //   description: error.message || "An unknown error occurred.",
        // });
        toast.error(error.message || "An unknown error occurred.");
        setServerError(error.message || 'Failed to create team.');
      },
    });
  };

  // Handle dialog close/reset
  const handleOpenChange = (open: boolean) => {
     if (!open) {
         reset(); // Reset form when dialog closes
         setServerError(null);
     }
     onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* If triggered by external button, DialogTrigger would be used there */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Enter the name for the new team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} id="create-team-form">
          <div className="grid gap-4 py-4">
             {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                className={`col-span-3 ${errors.name ? 'border-red-500' : ''}`}
                disabled={isPending}
                autoFocus
              />
              {errors.name && <p className="col-span-4 text-sm text-red-500 text-right">{errors.name.message}</p>}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="create-team-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Creating...' : 'Create Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}