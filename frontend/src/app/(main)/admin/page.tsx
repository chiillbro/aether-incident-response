// frontend/src/app/(admin)/admin/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-4">Welcome to the Aether administration area.</p>
      <div className="space-x-4">
          <Button asChild>
              <Link href="/admin/teams">Manage Teams</Link>
          </Button>
          {/* Add links to other admin sections later */}
          {/* <Button asChild variant="outline">
              <Link href="/admin/users">Manage Users</Link>
          </Button> */}
      </div>
    </div>
  );
}