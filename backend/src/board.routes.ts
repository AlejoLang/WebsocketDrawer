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
    async ({ body, set, userId }) => {
      try {
        const { name, width, height } = body;
        const userRoomsCount = await prisma.drawBoard.count({
          where: {
            ownerId: userId,
          },
        });
        
        const maxRoomsPerUser = parseInt(process.env.MAX_ROOMS_PER_USER || "5", 10);
        if (userRoomsCount >= maxRoomsPerUser) {
          set.status = 400;
          return { success: false, error: "Maximum number of rooms per user reached" };
        }

        const createdRoom = await prisma.drawBoard.create({
          data: {
            name: name.slice(0, 50),
            ownerId: userId,
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
        width: t.Optional(t.Number()),
        height: t.Optional(t.Number()),
      }),
      isSignIn: true,
    },
  )
  .delete(
    "/room/:roomId",
    async ({ params, set, userId }) => {
      const roomId = parseInt(params.roomId, 10);

      if (Number.isNaN(roomId)) {
        set.status = 400;
        return { success: false, error: "Invalid room id" };
      }

      try {
        const room = await prisma.drawBoard.findUnique({
          where: {
            id: roomId,
          },
          select: {
            id: true,
            ownerId: true,
          },
        });

        if (!room) {
          set.status = 404;
          return { success: false, error: "Room not found" };
        }

        if (room.ownerId !== userId) {
          set.status = 403;
          return {
            success: false,
            error: "You are not the owner of this room",
          };
        }

        await prisma.drawBoard.delete({
          where: {
            id: roomId,
          },
        });

        return { success: true, deletedRoomId: room.id };
      } catch (error) {
        console.error("Error deleting room:", error);
        set.status = 400;
        return { success: false, error: "Failed to delete room" };
      }
    },
    {
      isSignIn: true,
    },
  );

