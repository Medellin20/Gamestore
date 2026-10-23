import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) {
  const { response, user, isAdmin } = await updateSession(request);
  const path = request.nextUrl.pathname;
  if (path !== '/admin/login' && (!user || !isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
