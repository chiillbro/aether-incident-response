// frontend/src/app/(main)/dashboard/page.tsx
import { getServerSession } from 'next-auth/next'; // Import from /next for server components
import { authOptions } from '@/components/lib/auth';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function DashboardPage() {
  // Fetch session on the server side for server components
  const session = await getServerSession(authOptions);

  // Middleware should protect this page, but we can double-check
  if (!session) {
     // This usually won't be reached due to middleware, but good practice
     // Or you could redirect here, but middleware handles it cleaner
     return <p>Access Denied. Please log in.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Aether Dashboard</h1>
      <p className="mb-2">Welcome, {session.user?.name ?? 'User'}!</p>
      <p className="mb-2">Your Email: {session.user?.email}</p>
      <p className="mb-4">Your Role: {session.user?.role}</p>
      {/* Add Dashboard content here */}

      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs my-4">
        {JSON.stringify(session, null, 2)}
      </pre>

      <SignOutButton />
    </div>
  );
}