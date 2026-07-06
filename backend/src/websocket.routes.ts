import { t, Elysia } from "elysia";
import { CanvasActions, CanvasTools } from "./types";
import { rooms } from "./rooms";
import { prisma } from "./prisma_db";

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
    const roomInfo = await prisma.drawBoard.findUnique({
      where: {
        id: parseInt(roomId),
      },
    });
    if (!roomInfo) {
      return;
    }
    ws.subscribe(roomId);
    if (roomInfo.imageData) {
      ws.send(
        JSON.stringify({
          type: CanvasActions.INIT,
          data: {
            image: roomInfo.imageData,
            width: roomInfo.width,
            height: roomInfo.height,
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
    }
  },
  close(ws) {
    const roomId = ws.data.params.roomId;
    const room = rooms.find((r) => r.id === parseInt(roomId));
    /*if (room) {
      if (room.users <= 0) {
        if (room.deleteTimeout) {
          clearTimeout(room.deleteTimeout);
        }
        room.deleteTimeout = setTimeout(
          () => {
            const index = rooms.findIndex((r) => r.id === roomId);
            if (index !== -1 && rooms[index].users <= 0) {
              rooms.splice(index, 1);
              console.log(`Room ${roomId} deleted due to inactivity`);
            }
          },
          5 * 60 * 1000,
        );
      }
    }*/
  },
});

