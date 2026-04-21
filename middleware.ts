import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher(['/dashboard(.*)', '/settings(.*)'])
const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/create-account(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Already signed in — bounce away from auth pages
  if (userId && isAuthPage(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isProtected(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
