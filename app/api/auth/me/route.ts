import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { withApiLogging } from '@/src/common/server/logger';

export const GET = withApiLogging(async () => {
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
});
