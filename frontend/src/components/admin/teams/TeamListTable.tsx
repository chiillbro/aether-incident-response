import Link from 'next/link';
import { TeamSnippet as Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';

interface TeamListTableProps {
  teams: Team[];
}

export function TeamListTable({ teams }: TeamListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.length === 0 && (
            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No teams found.</TableCell></TableRow>
        )}
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell className="font-medium">{team.name}</TableCell>
            <TableCell>{new Date(team.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
               <Button variant="outline" size="sm" asChild>
                   <Link href={`/admin/teams/${team.id}`}>
                       <Eye className="mr-1 h-4 w-4" /> View
                   </Link>
               </Button>
               {/* Add Edit/Delete buttons later if needed */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}