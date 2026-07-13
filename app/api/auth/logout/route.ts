import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const user = await getAuthUser();
    
    if (user) {
      // Clear refresh token in DB
      await db.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
    }

    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
