import { NextResponse } from 'next/server';
import { deleteCurrentSession } from '@/lib/auth';
import { withApiLogging } from '@/lib/server/logger';

export const POST = withApiLogging(async () => {
  try {
    await deleteCurrentSession();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
