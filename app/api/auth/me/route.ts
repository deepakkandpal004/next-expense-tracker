import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ user: null });
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
    console.error('Get profile session error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
