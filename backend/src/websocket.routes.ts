import { t, Elysia } from "elysia";
import { CanvasActions, CanvasTools } from "./types";
import { rooms } from "./rooms";
import { prisma } from "./prisma_db";
import { Canvas, loadImage } from "canvas";

const CANVAS_SAVE_INTERVAL = 0.5 * 60 * 1000;

const saveCanvasToDatabase = async (roomId: number, canvas: Canvas) => {
  const imageData = canvas.toDataURL().split(",")[1];
  await prisma.drawBoard.update({
    where: { id: roomId },
    data: { imageData },
  });
};

export const websocketRoutes = new Elysia().ws("/canvas/:roomId", {
  params: t.Object({
    roomId: t.String(),
  }),
  body: t.Object({
    action: t.Enum(CanvasActions),
    toolType: t.Enum(CanvasTools),
    toolSize: t.Number(),
    strokeColor: t.String(),
    x1: t.Number(),
    y1: t.Number(),
    x2: t.Number(),
    y2: t.Number(),
  }),

  async open(ws) {
    const { roomId } = ws.data.params;
    let roomInfo = rooms.find((r) => r.id === parseInt(roomId));
    if (!roomInfo) {
      const roomData = await prisma.drawBoard.findUnique({
        where: {
          id: parseInt(roomId),
        },
      });
      if (!roomData) {
        ws.close(1000, "Room not found");
        return;
      }
      roomInfo = {
        id: roomData.id,
        name: roomData.name,
        ownerId: roomData.ownerId,
        canvas: new Canvas(roomData.width, roomData.height),
      };
      if (roomData.imageData) {
        const ctx = roomInfo?.canvas?.getContext("2d");
        if (ctx) {
          const img = await loadImage(
            `data:image/png;base64,${roomData.imageData}`,
          );
          ctx.drawImage(img, 0, 0);
        }
      }
      roomInfo.usersConected = 0;
      rooms.push(roomInfo);
    }
    ws.subscribe(roomId);
    roomInfo.usersConected = (roomInfo.usersConected || 0) + 1;
    if (roomInfo.canvas && roomInfo.usersConected === 1) {
      roomInfo.saveTimeout = setInterval(() => {
        saveCanvasToDatabase(roomInfo!.id, roomInfo!.canvas);
      }, CANVAS_SAVE_INTERVAL);
    }
    if (roomInfo.canvas) {
      const imageData = roomInfo.canvas.toDataURL().split(",")[1];
      ws.send(
        JSON.stringify({
          type: CanvasActions.INIT,
          data: {
            image: imageData,
            width: roomInfo.canvas.width,
            height: roomInfo.canvas.height,
          },
        }),
      );
    }
  },
  async message(ws, message) {
    const { roomId } = ws.data.params;
    const { action, toolType, toolSize, strokeColor } = message;
    const { x1, y1, x2, y2 } = message;
    const canvas = rooms.find((r) => r.id === parseInt(roomId))?.canvas;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (action === CanvasActions.DRAW) {
        ctx.lineWidth = toolSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (toolType === CanvasTools.PEN) {
          ctx.strokeStyle = strokeColor;
          ctx.globalCompositeOperation = "source-over";
        } else if (toolType === CanvasTools.ERASER) {
          ctx.globalCompositeOperation = "destination-out";
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();

        const m = {
          type: CanvasActions.DRAW,
          data: message,
        };
        ws.publish(roomId, m);
      } else if (action === CanvasActions.CLEAR) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const m = {
          type: CanvasActions.CLEAR,
        };
        ws.publish(roomId, m);
      }
      // Save the canvas state to the array of rooms
      const room = rooms.find((r) => r.id === parseInt(roomId));
      if (room) {
        room.canvas = canvas;
        // Save the canvas state to the database
      }
    }
  },
  close(ws) {
    const roomId = ws.data.params.roomId;
    const room = rooms.find((r) => r.id === parseInt(roomId));
    if (room) {
      room.usersConected = (room.usersConected || 1) - 1;
      if (room.usersConected === 0 && room.saveTimeout) {
        clearInterval(room.saveTimeout);
      }
    }
  },
});

