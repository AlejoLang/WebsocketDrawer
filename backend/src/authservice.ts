import { resolve } from "bun";
import { Elysia, t } from "elysia";
import { prisma } from "./prisma_db";

export const AuthService = new Elysia({ name: "Auth.Service" })
  .guard({
    cookie: t.Cookie({
      session: t.Optional(t.String()),
    }),
  })
  .macro({
    isSignIn: {
      async resolve({ cookie: { session }, status }) {
        if (!session.value) {
          return status(401, { error: "Unauthorized" });
        }
        const sessionData = await prisma.session.findUnique({
          where: {
            token: session.value,
          },
        });
        if (!sessionData || sessionData.expiresAt < new Date()) {
          return status(401, { error: "Unauthorized" });
        }
        return { userId: sessionData.userId };
      },
    },
  });

