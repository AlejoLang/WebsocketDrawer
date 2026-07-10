import { Elysia, t } from "elysia";
import { prisma } from "./prisma_db";
import { AuthService } from "./authservice";

export const userRoutes = new Elysia()
  .use(AuthService)
  .get(
    "/user/me",
    async ({ cookie: { session }, set }) => {
      try {
        if (typeof session.value !== "string" || !session.value) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const token = session.value;

        const sessionData = await prisma.session.findUnique({
          where: {
            token,
          },
        });

        if (!sessionData || sessionData.expiresAt < new Date()) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
          where: {
            id: sessionData.userId,
          },
        });

        if (!user) {
          set.status = 404;
          return { error: "User not found" };
        }

        return { user: { id: user.id, username: user.username } };
      } catch (error) {
        console.error("Error fetching user:", error);
        set.status = 500;
        return { error: "Internal server error" };
      }
    },
    {
      isSignIn: true,
    },
  )
  .post(
    "/user/register",
    async ({ body, set }) => {
      try {
        const { username, password } = body;
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });
        if (existingUser) {
          set.status = 400;
          return { error: "Username already exists" };
        }
        const hashedPassword = await Bun.password.hash(password, {
          algorithm: "bcrypt",
          cost: 10,
        });

        const newUser = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });
        return { id: newUser.id, username: newUser.username };
      } catch (error) {
        console.error("Error registering user:", error);
        set.status = 500;
        return { error: "Internal server error" };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )
  .post(
    "/user/login",
    async ({ body, cookie: { session }, set }) => {
      try {
        const { username, password } = body;
        const user = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (!user) {
          set.status = 401;
          return { error: "Invalid username" };
        }

        const isPasswordValid = await Bun.password.verify(
          password,
          user.password,
        );

        if (!isPasswordValid) {
          set.status = 401;
          return { error: "Invalid password" };
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Token expires in 7 days

        await prisma.session.create({
          data: {
            userId: user.id,
            token,
            expiresAt,
          },
        });

        session.set({
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: expiresAt,
          path: "/",
        });

        return { id: user.id, username: user.username };
      } catch (error) {
        console.error("Error logging in user:", error);
        set.status = 500;
        return { error: "Internal server error" };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )
  .post("/user/logout", async ({ cookie: { session }, set }) => {
    try {
      const token = session?.value;
      if (token) {
        await prisma.session.deleteMany({
          where: {
            token,
          },
        });
      }
      session.remove();
      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("Error logging out user:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  });
