import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateIncidentInput, createIncidentSchema } from '@/lib/validations/incident';
import { useCreateIncident } from '@/hooks/api/useCreateIncident';
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
import { IncidentSeverity } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';


interface CreateIncidentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onIncidentCreated: () => void; // Callback after successful creation
}

export function CreateIncidentDialog({ isOpen, onOpenChange, onIncidentCreated }: CreateIncidentDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate: createIncident, isPending } = useCreateIncident();

  const {
    register,
    handleSubmit,
    reset,
    control, // Needed for Select component
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: { // Set defaults
        title: '',
        description: '',
        severity: IncidentSeverity.SEV2 // Default severity
    }
  });

  const onSubmit = (data: CreateIncidentInput) => {
    setServerError(null); // Clear previous server errors
    console.log('Submitting incident data:', data);
    createIncident(data, {
      onSuccess: () => {
        toast.success(`Incident "${data.title}" has been created successfully.`);
        // toast({ // Show success toast
        //   titleT: "Incident Declared",
        //   description: `Incident "${data.title}" has been created successfully.`,
        // });
        reset(); // Reset form fields
        onIncidentCreated(); // Call the callback prop
      },
      onError: (error) => {
        toast.error(`Failed to create incident: ${error.message}`);
        //  toast({ // Show error toast
        //      variant: "destructive",
        //      title: "Failed to Create Incident",
        //      description: error.message || "An unknown error occurred.",
        //  });
        setServerError(error.message || 'Failed to create incident.');
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
                disabled={isPending}
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
                  disabled={isPending}
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
                disabled={isPending}
                rows={4}
              />
               {errors.description && <p className="col-span-4 text-sm text-red-500 text-right">{errors.description.message}</p>}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="create-incident-form" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Incident'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}