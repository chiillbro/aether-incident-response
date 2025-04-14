// frontend/src/lib/axios.ts
import axios from 'axios';
import { getSession, signOut } from 'next-auth/react'; // Use client-side function

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    // Check if running on the client side before calling getSession
    if (typeof window !== 'undefined') {
      const session = await getSession(); // Fetch current session client-side
      if (session?.accessToken && config.headers) {
        // console.log('Interceptor: Adding token to request', session.accessToken); // Careful logging tokens
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      } else {
        // console.log('Interceptor: No session token found');
      }
    } else {
        // console.log('Interceptor: Running on server, skipping getSession');
        // For server-side calls (e.g., in API routes or getServerSideProps if using Pages router),
        // you'd need a different way to get the token (e.g., getToken from next-auth/jwt).
        // For App Router Server Components, fetch calls are typically made directly
        // and may require manually passing the token if needed.
    }
    return config;
  },
  (error) => {
    console.error('Axios Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling 401s (e.g., trigger logout, refresh token)
apiClient.interceptors.response.use(
  (response) => response, // Simply return successful responses
  async (error) => {
    const originalRequest = error.config;
    if (axios.isAxiosError(error)) {
        console.error('Axios Response Error:', error.response?.status, error.response?.data);
        // Handle 401 Unauthorized specifically - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark request to prevent infinite loops
            console.log('Axios Interceptor: Received 401');
            // Here you would typically implement token refresh logic if you had refresh tokens.
            // Since we only have an access token from the backend example:
            // We can trigger a forced sign-out.

            // Avoid triggering signOut on the server side
            if (typeof window !== 'undefined') {
                console.log('Triggering signOut due to 401');
                // Use a small delay or check current path to avoid issues during initial load/redirect
                // await signOut({ redirect: false }); // Sign out without immediate redirect
                // window.location.href = '/login?sessionExpired=true'; // Force redirect
                // OR use next-auth/react signOut with redirect
                await signOut({ callbackUrl: '/login?sessionExpired=true' });
            }
            // Return a specific error or null to stop the original request's promise chain
            return Promise.reject(new Error("Session expired or invalid"));
        }
    }
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);


export default apiClient; // Export the configured instance