// frontend/src/components/auth/RegisterForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios'; // Use standard axios
import Link from 'next/link';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

// Re-use or create a similar Card component
const AuthCard = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-md w-full mx-auto bg-white shadow-md rounded-lg p-8">
      {children}
    </div>
  );


export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendRegisterUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`;

      console.log("Register URL:", backendRegisterUrl)
      const response = await axios.post(backendRegisterUrl, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setIsLoading(false);

      if (response.status === 201) {
        // Registration successful
        console.log('Registration successful, redirecting to login...');
        // Redirect to login page after successful registration
        router.push('/login?registered=true'); // Add query param for potential message
      } else {
        // Handle unexpected success statuses if needed
        setError('Registration failed. Unexpected response.');
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('Registration Submit Catch Error:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Try to get specific error from backend response
        const backendError = err.response.data?.message || 'Registration failed. Please try again.';
         // Handle specific cases like email already exists
        if (err.response.status === 409 || backendError.toLowerCase().includes('email already exists')) {
             setError('This email address is already registered.');
        } else {
             setError(backendError);
        }
      } else {
        setError('An error occurred during registration. Please check your connection.');
      }
    }
  };

  return (
    <AuthCard>
        <h2 className="text-2xl font-semibold text-center mb-6">Create your Aether Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <Label
            htmlFor="name"
            className="block text-sm font-medium"
          >
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className={`mt-1 w-full border ${
              errors.name ? 'border-red-500' : ''
            } focus:outline-none sm:text-sm`}
             disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
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

         {/* Add Confirm Password field if using refine in Zod */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center text-sm font-medium focus:outline-none"
          >
             {isLoading ? 'Registering...' : 'Register'}
          </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Login here
        </Link>
      </p>
    </AuthCard>
  );
}