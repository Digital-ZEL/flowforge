import { NextRequest, NextResponse } from 'next/server';
import { AUTH, createSessionToken } from '@/lib/auth';
import { RATE_LIMITS, checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`${ip}:auth-login`, {
      maxRequests: 10,
      windowMs: RATE_LIMITS.analyze.windowMs,
    });
    if (!rate.success) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
    }

    const accessPassword = process.env.ACCESS_PASSWORD;
    if (!accessPassword) {
      return NextResponse.json(
        { error: 'ACCESS_PASSWORD is not configured on the server' },
        { status: 500 }
      );
    }

    if (password !== accessPassword) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH.SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH.SESSION_TTL_SECONDS,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
