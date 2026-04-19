import { PrismaClient } from "@prisma/client";

const basePrisma = new PrismaClient({
  log: ["query"],
});

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;

        // 터미널에 모델명, 연산 종류, 그리고 전달된 인자(args)를 예쁘게 출력
        console.log(
          `\x1b[36m[Prisma Query]\x1b[0m ${model}.${operation} took ${duration}ms`,
        );
        console.dir(args, { depth: null }); // 여기서 실제 들어간 값을 확인할 수 있습니다.

        return result;
      },
    },
  },
});

const globalForPrisma = globalThis as unknown as { prisma: typeof prisma };
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
