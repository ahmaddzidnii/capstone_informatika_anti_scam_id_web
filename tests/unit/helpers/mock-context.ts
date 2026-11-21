import { vi } from "vitest";
import type { createTRPCContext } from "@/trpc/init";
import { createCaller } from "@/trpc/routers/_app";

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export function createMockPrisma() {
  const mockPrisma = {
    check: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
    },
    document: {
      update: vi.fn(),
    },
    report: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    reportReview: {
      create: vi.fn(),
    },
    botInteraction: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      if (typeof arg === "function") {
        return (arg as (tx: unknown) => Promise<unknown>)(mockPrisma);
      }
      return arg;
    }),
  };

  return mockPrisma;
}

export function createTestCaller(options?: {
  role?: "guest" | "user" | "admin";
  userId?: string;
  isInternalBot?: boolean;
  headers?: Record<string, string>;
}) {
  const mockPrisma = createMockPrisma();
  const role = options?.role ?? "guest";
  const userId = options?.userId ?? "user-test-123";

  const session =
    role === "guest"
      ? null
      : ({
          user: {
            id: userId,
            name: "Tester",
            email: "tester@antiscam.id",
            role,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: {
            id: "sess-123",
            userId,
            token: "token-123",
            expiresAt: new Date(Date.now() + 3600_000),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        } as unknown as TRPCContext["session"]);

  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };

  const caller = createCaller({
    prisma: mockPrisma as never,
    logger: mockLogger as never,
    session,
    headers: new Headers(options?.headers),
    isInternalBot: options?.isInternalBot ?? false,
  });

  return { caller, mockPrisma, mockLogger };
}
