const { PrismaClient } = require("@prisma/client");
(async () => {
  const prisma = new PrismaClient();
  const u = await prisma.user.findUnique({ where: { email: "dk@gmail.com" } });
  console.log("user.updatedAt:", u.updatedAt);
  const recs = await prisma.record.findMany({ where: { userId: u.id }, select: { text: true, amount: true, createdAt: true, updatedAt: true }, orderBy: { updatedAt: "asc" } });
  for (const r of recs) console.log(`${r.updatedAt.toISOString()}  ${r.text}: ${r.amount}  (created ${r.createdAt.toISOString()})`);
  const goals = await prisma.goal.findMany({ where: { userId: u.id }, select: { name: true, targetAmount: true, updatedAt: true, createdAt: true } });
  for (const g of goals) console.log(`GOAL ${g.updatedAt.toISOString()} ${g.name}: ${g.targetAmount} (created ${g.createdAt.toISOString()})`);
  await prisma.$disconnect();
})();
