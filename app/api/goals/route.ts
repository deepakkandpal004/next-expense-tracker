import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { withApiLogging } from "@/src/common/server/logger";
import z from "zod";

export const GET = withApiLogging(async () => {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Goals fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});

export const DELETE = withApiLogging(async (request: Request) => {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Goal id is required" },
        { status: 400 },
      );
    }

    const goal = await db.goal.findFirst({
      where: { id, userId: user.id },
    });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await db.goal.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Goal delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});

const goalInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  targetAmount: z.number().positive().max(999_999_999.99),
  currentAmount: z.number().nonnegative().max(999_999_999.99).optional(),
  monthlyContribution: z.number().nonnegative().max(999_999_999.99).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be a valid YYYY-MM-DD date")
    .optional(),
});

export const POST = withApiLogging(async (request: Request) => {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = goalInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const {
      name,
      targetAmount,
      currentAmount,
      monthlyContribution,
      category,
      deadline,
    } = parsed.data;

    const goal = await db.goal.create({
      data: {
        userId: user.id,
        name,
        targetAmount,
        currentAmount: currentAmount ?? 0,
        monthlyContribution: monthlyContribution ?? 0,
        category: category ?? "other",
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Goal create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
