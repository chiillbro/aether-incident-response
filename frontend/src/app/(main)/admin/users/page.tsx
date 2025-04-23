// frontend/src/app/(admin)/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useGetUsers } from '@/hooks/api/admin/useGetUsers';
import { UserCard } from '@/components/admin/users/UserCard';
import { UserDetailFlyout } from '@/components/admin/users/UserDetailFlyout';
import { UserSnippet } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, UserCog, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For filtering
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function AdminUsersPage() {
  const { data: users, isLoading, error, refetch } = useGetUsers();
  const [selectedUser, setSelectedUser] = useState<UserSnippet | null>(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const handleEditClick = (user: UserSnippet) => {
    setSelectedUser(user);
    setIsFlyoutOpen(true);
  };

  const handleFlyoutChange = (open: boolean) => {
    setIsFlyoutOpen(open);
    if (!open) {
        setSelectedUser(null); // Clear selection when closing
    }
  }

  const filteredUsers = users?.filter(user =>
      user.name?.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className='flex items-center gap-3'>
             <UserCog className="h-7 w-7 text-primary" />
             <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">User Management</h1>
        </div>
        <div className="w-full sm:w-auto sm:max-w-xs">
            <Input
                placeholder="Filter by name or email..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full"
            />
        </div>
        {/* Add Create User Button/Dialog here if needed */}
      </div>

       {/* Loading State */}
       {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => ( // Render 8 skeletons
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Skeleton className='h-12 w-12 rounded-full'/>
                            <div className='space-y-1 flex-1'><Skeleton className='h-5 w-3/4'/><Skeleton className='h-4 w-full'/></div>
                        </CardHeader>
                        <CardContent className='space-y-2 pt-2'>
                             <Skeleton className='h-4 w-1/2'/>
                             <Skeleton className='h-4 w-1/2'/>
                             <Skeleton className='h-4 w-1/2'/>
                        </CardContent>
                        <CardFooter><Skeleton className='h-9 w-full'/></CardFooter>
                    </Card>
                ))}
            </div>
       )}

       {/* Error State */}
        {error && (
           <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5"/>
              <span>Error loading users: {error.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
           </div>
        )}

       {/* User Grid */}
       {!isLoading && !error && filteredUsers && (
            filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} onEditClick={handleEditClick} />
                ))}
                </div>
            ) : (
                 <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-background">
                     <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                     <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                     <p className="text-sm text-muted-foreground">
                        {filter ? `No users match your filter "${filter}".` : "There are no users in the system yet."}
                     </p>
                     {filter && <Button variant="outline" onClick={() => setFilter('')} className="mt-4">Clear Filter</Button>}
                 </div>
            )
       )}

      {/* Detail Flyout Panel */}
      <UserDetailFlyout
        user={selectedUser}
        isOpen={isFlyoutOpen}
        onOpenChange={handleFlyoutChange}
      />
    </div>
  );
}