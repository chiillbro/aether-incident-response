// frontend/src/components/admin/users/UserCard.tsx
import { UserSnippet, Role } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, ShieldCheck, Pencil } from 'lucide-react';
import { useGetTeams } from '@/hooks/api/admin/useGetTeams'; // To display team name

interface UserCardProps {
  user: UserSnippet;
  onEditClick: (user: UserSnippet) => void; // Callback to open detail flyout
}

// Helper to get first initial or fallback
const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function UserCard({ user, onEditClick }: UserCardProps) {
   // Fetch teams data to display team name instead of just ID
   const { data: teams } = useGetTeams();
   const teamName = teams?.find(t => t.id === user.teamId)?.name ?? 'No Team';

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          {/* Placeholder - replace with actual image logic if available */}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <CardTitle className="text-lg truncate" title={user.name ?? 'Unnamed User'}>
             {user.name || <span className="italic text-muted-foreground">Unnamed User</span>}
          </CardTitle>
          <CardDescription className="truncate" title={user.email}>
            {user.email}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm pt-2">
         <div className='flex items-center gap-2 text-muted-foreground'>
            <ShieldCheck className='h-4 w-4'/> Role: <Badge variant={user.role === Role.ADMIN ? "default" : "secondary"} className='ml-auto'>{user.role}</Badge>
         </div>
         <div className='flex items-center gap-2 text-muted-foreground'>
             <Users className='h-4 w-4'/> Team: <span className='ml-auto font-medium'>{teamName}</span>
         </div>
         <div className='flex items-center gap-2 text-muted-foreground'>
             <Mail className='h-4 w-4'/> Joined: <span className='ml-auto'>{new Date(user.createdAt).toLocaleDateString()}</span>
         </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onEditClick(user)}>
           <Pencil className='mr-2 h-4 w-4'/> Edit User
        </Button>
      </CardFooter>
    </Card>
  );
}