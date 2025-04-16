import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateIncidentInput, createIncidentSchema } from '@/lib/validations/incident';
import { useCreateIncident } from '@/hooks/api/incidents/useCreateIncident';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IncidentSeverity, IncidentStatus } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { useGetTeams } from '@/hooks/api/teams/useGetTeams';
import { Skeleton } from '../ui/skeleton';


interface CreateIncidentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onIncidentCreated: () => void; // Callback after successful creation
}

export function CreateIncidentDialog({ isOpen, onOpenChange, onIncidentCreated }: CreateIncidentDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: createIncident, isPending: isCreatingIncident } = useCreateIncident();

  // Fetch teams
  const { data: teams, isLoading: isLoadingTeams, error: teamsError } = useGetTeams();

  const {
    register,
    handleSubmit,
    reset,
    control, // Needed for Controller component
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: { // Set defaults
        title: '',
        description: '',
        severity: IncidentSeverity.SEV2, // Default severity
        teamId: undefined,
    }
  });

  const onSubmit = (data: CreateIncidentInput) => {
    setServerError(null); // Clear previous server errors
    console.log('Submitting incident data:', data);
    createIncident(data, {
      onSuccess: (createdIncident) => {
        toast.success(`Incident "${createdIncident.title}" declared successfully.`);
        
        reset(); // Reset form fields
        onIncidentCreated(); // Call the callback prop
        onOpenChange(false); // Close dialog on success
      },
      onError: (error: any) => { // Use 'any' or define a specific error type
        const message = error?.response?.data?.message || error.message || 'Failed to declare incident.';

        toast.error(`Error: ${message}`);
        setServerError(message);
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

  // Reset form if teams data changes (e.g., on refetch) or dialog opens
  useEffect(() => {
    if (isOpen) {
        reset({ // Reset with defaults when opening
            title: '',
            description: '',
            severity: IncidentSeverity.SEV2,
            teamId: undefined,
        });
    }
}, [isOpen, reset]);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[480px]"> {/* Slightly wider */}
                <DialogHeader>
                    <DialogTitle>Declare New Incident</DialogTitle>
                    <DialogDescription>
                        Fill in the details and assign a team to handle the incident.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} id="create-incident-form">
                    <div className="grid gap-4 py-4">
                        {serverError && <p className="text-sm text-red-500 px-1">{serverError}</p>}
                        {teamsError && <p className="text-sm text-red-500 px-1">Error loading teams: {teamsError.message}</p>}

                        {/* Title */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title *</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                className={`col-span-3 ${errors.title ? 'border-red-500' : ''}`}
                                disabled={isCreatingIncident}
                                aria-invalid={errors.title ? "true" : "false"}
                            />
                            {errors.title && <p role="alert" className="col-span-4 text-sm text-red-500 text-right">{errors.title.message}</p>}
                        </div>

                         {/* Team Selection */}
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teamId" className="text-right">Team *</Label>
                            {isLoadingTeams ? (
                                 <Skeleton className="h-10 col-span-3" />
                             ) : (
                                 <Controller
                                     control={control}
                                     name="teamId"
                                     render={({ field }) => (
                                         <Select
                                             value={field.value ?? ''} // Handle undefined initial value for placeholder
                                             onValueChange={field.onChange}
                                             disabled={isCreatingIncident || isLoadingTeams || !!teamsError || !teams?.length}
                                             name={field.name} // Pass name for accessibility/form association
                                         >
                                             <SelectTrigger
                                                 id="teamId"
                                                 className={`col-span-3 ${errors.teamId ? 'border-red-500' : ''}`}
                                                 aria-invalid={errors.teamId ? "true" : "false"}
                                             >
                                                 <SelectValue placeholder="Select responding team" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                 {teams && teams.length > 0 ? (
                                                     teams.map((team) => (
                                                         <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                                     ))
                                                 ) : (
                                                     <SelectItem value="no-teams" disabled>
                                                         {teamsError ? 'Could not load teams' : 'No teams available'}
                                                     </SelectItem>
                                                 )}
                                             </SelectContent>
                                         </Select>
                                     )}
                                 />
                             )}
                            {errors.teamId && <p role="alert" className="col-span-4 text-sm text-red-500 text-right">{errors.teamId.message}</p>}
                         </div>

                         {/* Severity Selection */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="severity" className="text-right">Severity</Label>
                            <Controller
                                 control={control}
                                 name="severity"
                                 render={({ field }) => (
                                     <Select
                                         value={field.value}
                                         onValueChange={field.onChange}
                                         disabled={isCreatingIncident}
                                         name={field.name}
                                     >
                                         <SelectTrigger
                                             id="severity"
                                             className={`col-span-3 ${errors.severity ? 'border-red-500' : ''}`}
                                             aria-invalid={errors.severity ? "true" : "false"}
                                         >
                                             <SelectValue placeholder="Select severity" />
                                         </SelectTrigger>
                                         <SelectContent>
                                             {Object.values(IncidentSeverity).map((sev) => (
                                                 <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                                             ))}
                                         </SelectContent>
                                     </Select>
                                 )}
                            />
                            {errors.severity && <p role="alert" className="col-span-4 text-sm text-red-500 text-right">{errors.severity.message}</p>}
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-4 items-start gap-4"> {/* Use items-start for label alignment */}
                            <Label htmlFor="description" className="text-right pt-2">Description</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Provide details about the incident (optional)..."
                                className={`col-span-3 ${errors.description ? 'border-red-500' : ''}`}
                                disabled={isCreatingIncident}
                                rows={4}
                                aria-invalid={errors.description ? "true" : "false"}
                            />
                            {errors.description && <p role="alert" className="col-span-4 text-sm text-red-500 text-right">{errors.description.message}</p>}
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button
                        type="submit"
                        form="create-incident-form"
                        disabled={isCreatingIncident || isLoadingTeams}
                    >
                        {isCreatingIncident ? 'Declaring...' : 'Declare Incident'}
                    </Button>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreatingIncident}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


      <Dialog>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Declare New Incident</DialogTitle>
          <DialogDescription>
            Fill in the details for the new incident. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} id="create-incident-form">
          <div className="grid gap-4 py-4">
             {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                className={`col-span-3 ${errors.title ? 'border-red-500' : ''}`}
                disabled={isCreatingIncident}
              />
              {errors.title && <p className="col-span-4 text-sm text-red-500 text-right">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">Severity</Label>
               <Select
                  defaultValue={IncidentSeverity.SEV2}
                   // Need Controller from react-hook-form for Shadcn Select
                   onValueChange={(value) => {/* handle value change if needed, RHF handles state */}}
                  name="severity" // RHF needs name
                  disabled={isCreatingIncident}
                >
                  <SelectTrigger className="col-span-3">
                     <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                     {Object.values(IncidentSeverity).map((sev) => (
                       <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
              {/* RHF validation for select needs Controller wrapper, simplified here */}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Provide details about the incident..."
                className={`col-span-3 ${errors.description ? 'border-red-500' : ''}`}
                disabled={isCreatingIncident}
                rows={4}
              />
               {errors.description && <p className="col-span-4 text-sm text-red-500 text-right">{errors.description.message}</p>}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="create-incident-form" disabled={isCreatingIncident}>
            {isCreatingIncident ? 'Saving...' : 'Save Incident'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    
  );
}