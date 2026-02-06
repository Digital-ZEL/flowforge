import { NextRequest, NextResponse } from 'next/server';

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
    
    // Set httpOnly cookie with 7 day expiry
    response.cookies.set('ff_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
