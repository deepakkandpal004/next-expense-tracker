import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Goals fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, targetAmount, currentAmount, monthlyContribution, category, deadline } =
      await request.json();

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 },
      );
    }

    if (typeof targetAmount !== 'number' || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be a positive number' },
        { status: 400 },
      );
    }

    const goal = await db.goal.create({
      data: {
        userId: user.id,
        name,
        targetAmount,
        currentAmount: currentAmount ?? 0,
        monthlyContribution: monthlyContribution ?? 0,
        category: category ?? 'other',
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Goal create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
