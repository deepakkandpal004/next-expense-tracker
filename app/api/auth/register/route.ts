import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';

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

    await createSession(newUser.id);

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
