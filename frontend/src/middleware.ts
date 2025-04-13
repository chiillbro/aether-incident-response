// frontend/src/middleware.ts
// export { auth as default } from "@/lib/auth" // Option 1: Simple, uses default behavior

// Option 2: More control using next-auth/middleware directly
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request: NextRequestWithAuth) {
    // Example: Redirect based on role
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    // console.log("Middleware Token:", token);
    // console.log("Middleware Pathname:", pathname);

    // Allow access to auth pages even if logged in (e.g., view profile?)
    // Or redirect logged-in users away from login/register
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add more role-based or path-based logic here if needed
    // Example: if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url));
    // }

    // If no specific redirection, allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      // This determines if the middleware logic runs.
      // If authorized returns true, the middleware function above is executed.
      // If authorized returns false, user is redirected to signIn page (default behavior).
      authorized: ({ req, token }) => {
          const { pathname } = req.nextUrl;
          // Allow access to auth pages and API routes without a token
          if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/api')) {
              return true;
          }
          // Otherwise, require a token (user must be logged in)
          return !!token; // !! converts token (or null) to boolean
      }
    },
    pages: {
        signIn: '/login', // Ensure this matches your authOptions
    }
  }
);

// Specify which paths the middleware should run on
export const config = {
  // Matcher ignoring api, _next/static, _next/image, favicon.ico
  // Adjust this to match all pages you want protected
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - Auth.js API routes are handled internally
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Specific public pages if any (e.g., '/public-page')
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)', // Protect everything else
    // Or be more specific:
    // '/dashboard/:path*',
    // '/settings/:path*',
    // etc.
  ],
};