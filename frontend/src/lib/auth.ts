// frontend/src/lib/auth.ts
import { DefaultSession, DefaultUser, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios'; // Use standard axios here, not the interceptor instance

// Augment NextAuth types to include properties from your backend
declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role: string; // Assuming role is always present
    teamId?: string | null;
    backendTokens?: { // Store backend tokens here
      accessToken: string;
      // You might add refreshToken here later
    };
  }

  interface Session extends DefaultSession {
    user: User;
    accessToken: string; // Expose backend access token directly on session
    error?: 'CredentialsSignin' | string | null; // Optional error field
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    teamId?: string | null;
    accessToken: string; // Store backend access token in the JWT
    // refreshToken?: string;
    // accessTokenExpires?: number;
  }
}


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          console.error('Authorize Error: Missing credentials');
          // You can return null or throw an error
          // Returning null signals authentication failure without specific reason to client
          // Throwing an error can provide more context if needed
          return null;
          // throw new Error("Missing email or password");
        }

        let backendLoginUrl;
        if (process.env.NODE_ENV === 'development') {
            backendLoginUrl = `http://backend:3000/server-api/auth/login`;
        } else {
            backendLoginUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
        }
        // const backendLoginUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
        // const backendLoginUrl = `http://backend:3000/server-api/auth/login`;
        console.log(`Attempting login for ${credentials.email} to ${backendLoginUrl}`);

        try {
          const response = await axios.post(
            backendLoginUrl,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000, // 10 seconds timeout
            }
          );

          const data = response.data; // Expecting { user: { id, name, email, role, teamId? }, accessToken: string }

          if (response.status === 201 || response.status === 200 && data?.user && data?.accessToken) {
            console.log('Login successful for:', data.user.email);
            // Prepare the user object for NextAuth, including the backend token
            const user = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              teamId: data.user.teamId,
              backendTokens: { // Store the token here temporarily for the jwt callback
                accessToken: data.accessToken,
              }
            };
            return user; // This user object goes to the JWT callback
          } else {
             // This case might not be hit if axios throws for non-2xx statuses
             console.error('Authorize Error: Unexpected response status or data', response.status, data);
             return null;
          }
        } catch (error: any) {
           // Axios typically throws for non-2xx responses
          if (axios.isAxiosError(error)) {
            console.error(
              'Authorize Error (Axios):',
              error.response?.status,
              error.response?.data || error.message
            );
          } else {
            console.error('Authorize Error (Unknown):', error);
          }
           // Returning null triggers the generic auth error page/callback
           // You could potentially throw a specific error to handle differently
          return null;
          // throw new Error(error.response?.data?.message || "Login failed"); // Example: pass backend error
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt', // Use JWT for session management
    // maxAge: 30 * 24 * 60 * 60, // 30 days (optional)
  },

  callbacks: {
    // This callback is called whenever a JWT is created (signing in) or updated (session accessed).
    async jwt({ token, user }) {
      // `user` object is passed on initial sign-in (from authorize)
      // `account` object has provider details
      if (user) {
        // On successful sign-in, persist the backend access token and user details to the JWT
        console.log('JWT Callback: Signing in - Adding user data and token to JWT');
        token.accessToken = user.backendTokens!.accessToken;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.teamId = user.teamId;
      }
      // console.log('JWT Callback: Returning token', token); // Careful logging tokens
      return token; // The token is encrypted and stored in a cookie
    },

    // This callback is called whenever a session is checked.
    async session({ session, token }) {
      // `token` comes from the `jwt` callback.
      // We expose the necessary user info and the backend accessToken to the client session.
      if (token) {
        session.user = {
          id: token.id,
          name: token.name as string, // Asserting type as name should exist if token is valid
          email: token.email as string,
          role: token.role,
          teamId: token.teamId,
          // Do NOT include backendTokens here if already on JWT root
        };
        session.accessToken = token.accessToken; // Expose backend token
      }
      // console.log('Session Callback: Returning session', session); // Careful logging tokens
      return session;
    },
  },

  pages: {
    signIn: '/login', // Redirect users to '/login' when sign in is required
    // error: '/auth/error', // Optional: Custom error page
    // signOut: '/auth/signout', // Optional: Custom sign out page
  },

  secret: process.env.NEXTAUTH_SECRET, // Use the secret from .env

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

// Export handlers for the API route
// export default NextAuth(authOptions); // Not needed directly here, used in route.ts