import { NextResponse } from 'next/server';

// Auth disabled for frictionless alpha testing
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
