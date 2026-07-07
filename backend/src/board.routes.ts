import { Elysia, t } from "elysia";
import { Canvas } from "canvas";
import { prisma } from "./prisma_db";
import { rooms } from "./rooms";
import { AuthService } from "./authservice";

export const boardRoutes = new Elysia()
  .use(AuthService)
  .get(
    "/rooms",
    async () => {
      const roomsData = await prisma.drawBoard.findMany();
      return JSON.stringify(roomsData);
    },
    {
      isSignIn: true,
    },
  )
  .get("/room/:roomId/info", async ({ params, set }) => {
    const { roomId } = params;
    const roomInfo = await prisma.drawBoard.findUnique({
      where: {
        id: parseInt(roomId),
      },
    });
    if (!roomInfo) {
      set.status = 404;
      return null;
    }
    return {
      id: roomInfo.id,
      name: roomInfo.name,
      width: roomInfo.width,
      height: roomInfo.height,
    };
  })
  .post(
    "/room/create",
    async ({ body, set }) => {
      try {
        const { name, ownerId, width, height } = body;
        const createdRoom = await prisma.drawBoard.create({
          data: {
            name: name.slice(0, 50),
            ownerId,
            width: Math.max(100, Math.min(width || 1600, 1920)),
            height: Math.max(100, Math.min(height || 900, 1080)),
          },
        });
        const newRoom = {
          id: createdRoom.id,
          name: name.slice(0, 50),
          canvas: new Canvas(
            Math.max(100, Math.min(width || 1600, 1920)),
            Math.max(100, Math.min(height || 900, 1080)),
          ),
        };
        rooms.push(newRoom);
        return createdRoom.id;
      } catch (error) {
        console.error("Error creating room:", error);
        set.status = 400;
        return null;
      }
    },
    {
      body: t.Object({
        name: t.String(),
        ownerId: t.Number(),
        width: t.Optional(t.Number()),
        height: t.Optional(t.Number()),
      }),
    },
  );
