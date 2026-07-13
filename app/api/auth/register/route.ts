import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate nice avatar image using UI-Avatars
    const formattedName = encodeURIComponent(name);
    const imageUrl = `https://ui-avatars.com/api/?name=${formattedName}&background=10b981&color=fff&bold=true&size=128`;

    // Create user in DB
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        imageUrl,
      },
    });

    // Generate tokens
    const accessToken = await generateAccessToken(newUser.id, newUser.email);
    const refreshToken = await generateRefreshToken(newUser.id, newUser.email);

    // Save refresh token to DB
    await db.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          imageUrl: newUser.imageUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
