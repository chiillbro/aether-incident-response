// frontend/src/components/auth/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation'; // Use App Router's useRouter
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

// Optional: Simple Card component for styling
const AuthCard = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-md w-full mx-auto bg-white shadow-md rounded-lg p-8">
    {children}
  </div>
);

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      // Map common NextAuth errors to user-friendly messages
      if (errorParam === 'CredentialsSignin') {
        setError('Invalid email or password. Please try again.');
      } else {
         setError(`Authentication failed: ${errorParam}`); // Display other errors directly
      }
    }
  }, [searchParams]); // Re-run when searchParams change


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const result = await signIn('credentials', {
        // redirect: false, // Handle redirect manually
        email: data.email,
        password: data.password,
        callbackUrl: '/dashboard', // Optionally specify where to go after successful login
      });

      setIsLoading(false);

      // if (result?.error) {
      //   // Handle specific error codes from backend
      //   if (result.error.includes('credentials')) {
      //     setError('Invalid email/password combination');
      //   } else {
      //     setError(result.error);
      //   }
      // }

      if (result?.error) {
        console.error('Sign In returned error (pre-redirect):', result.error);
         if (result.error === 'CredentialsSignin') {
             setError('Invalid email or password. Please try again.');
         } else {
             setError(`Authentication failed: ${result.error}`);
         }
      } else if (result && !result.ok) {
          // Handle other non-error, non-ok scenarios if they exist
          setError('An unexpected sign-in issue occurred.');
      }

      // if (result?.error) {
      //   // NextAuth often returns 'CredentialsSignin' for generic errors
      //   // You might want more specific backend errors if configured
      //   console.error('Sign In Error:', result.error);
      //   setError('Invalid email or password. Please try again.'); // User-friendly message
      // } else if (result?.ok) {
      //   // Login successful
      //   console.log('Login successful, redirecting...');
      //   router.push('/dashboard'); // Redirect to dashboard or callbackUrl
      //   router.refresh(); // Refresh server components after login
      // } else {
      //   // Handle unexpected cases
      //   setError('An unexpected error occurred. Please try again.');
      // }
    } catch (err) {
      // Catch errors not handled by signIn (e.g., network issues)
      setIsLoading(false);
      console.error('Login Submit Catch Error:', err);
      setError('An error occurred during login. Please check your connection.');
    }
  };

  return (
    <AuthCard>
      <h2 className="text-2xl font-semibold text-center mb-6">Login to Aether</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <Label
            htmlFor="email"
            className="block text-sm font-medium"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`mt-1 w-full border ${
              errors.email ? 'border-red-500' : ''
            } focus:outline-none sm:text-sm`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="password"
            className="block text-sm font-medium"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`mt-1 w-full border ${
              errors.password ? 'border-red-500' : ''
            } focus:outline-none sm:text-sm`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Add Forgot Password link later */}
        {/* <div className="text-sm text-right">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div> */}


          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center text-sm font-medium focus:outline-none"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </Link>
      </p>
    </AuthCard>
  );
}