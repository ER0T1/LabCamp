import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  await prisma.user.upsert({ where: { email: "admin@labcamp.local" }, update: {}, create: { name: "LabCamp 管理員", email: "admin@labcamp.local", passwordHash, role: "ADMIN" } });
}

main().then(() => console.log("LabCamp seed completed. Admin: admin@labcamp.local")).finally(() => prisma.$disconnect());
