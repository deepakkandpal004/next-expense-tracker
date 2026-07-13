import { NextResponse } from 'next/server';
import { refreshSession } from '@/lib/auth';

export async function POST() {
  try {
    const user = await refreshSession();
    if (!user) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
