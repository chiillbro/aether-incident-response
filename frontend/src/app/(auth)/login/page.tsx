'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react'; // For handling searchParams
import { useSearchParams } from 'next/navigation';

// Optional: Display a message if redirected from registration
function RegistrationMessage() {
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    if (registered) {
        return <p className="text-green-600 text-center mb-4">Registration successful! Please log in.</p>;
    }
    return null;
}
// Because RegistrationMessage uses useSearchParams, it must be a Client Component
// OR wrapped in Suspense in its parent Server Component (LoginPage)


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
       {/* Wrap client component using searchParams in Suspense */}
       <Suspense fallback={<div>Loading message...</div>}>
           <RegistrationMessage />
       </Suspense>
      
      <Suspense fallback={<div>Loading message...</div>}>
          <LoginForm />
      </Suspense>
    </div>
  );
}

// import { useState } from "react";
// import { signIn, signOut, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { useQueryClient } from "@tanstack/react-query";
// import { zodResolver } from "@hookform/resolvers/zod";

// const LoginSchema = z.object({
//   email: z.string().email(),
//   password: z.string(),
// });

// export default function Login() {
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const { data: session } = useSession();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(LoginSchema),
//   });

//   const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
//     try {
//       await signIn("credentials", {
//         email: data.email,
//         password: data.password,
//       });
//       queryClient.invalidateQueries();
//       router.push("/");
//     } catch (error: any) {
//       setError(error.message);
//     }
//   };

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold">Login</h1>
//         </div>

//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="mt-8 space-y-6"
//         >
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Email address
//             </label>
//             <input
//               type="email"
//               id="email"
//               {...register("email")}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               placeholder="Email address"
//             />
//             {errors.email && (
//               <p className="mt-2 text-sm text-red-600" role="alert">
//                 {errors.email.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               {...register("password")}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               placeholder="Password"
//             />
//             {errors.password && (
//               <p className="mt-2 text-sm text-red-600" role="alert">
//                 {errors.password.message}
//               </p>
//             )}
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//               />
//               <label
//                 htmlFor="remember-me"
//                 className="ml-2 block text-sm text-gray-900"
//               >
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <a
//                 href="#"
//                 className="font-medium text-indigo-600 hover:text-indigo-500"
//               >
//                 Forgot your password?
//               </a>
//             </div>
//           </div>

//           <div className="flex items-center justify-end">
//             <button
//               type="submit"
//               className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//             > 
//               <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                 <svg
//                   className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                   aria-hidden="true"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </span>
//               Sign in
//             </button>
//           </div>
//         </form>

//         {session?.user && (
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <a
//                 href="#"
//                 className="font-medium text-indigo-600 hover:text-indigo-500"
//               >
//                 Sign in
//               </a>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };