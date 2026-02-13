import { t, Elysia } from 'elysia';
import { CanvasActions, CanvasTools } from './types';
import { rooms } from './rooms';

export const websocketRoutes = new Elysia().ws('/canvas/:roomId', {
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

  open(ws) {
    const { roomId } = ws.data.params;
    const roomData = rooms.find((room) => room.id === roomId);
    if (!roomData) {
      return;
    }
    ws.subscribe(roomData.id);
    if (roomData.canvas) {
      const base64Image = roomData.canvas
        .toBuffer('image/png')
        .toString('base64');
      ws.send(
        JSON.stringify({
          type: CanvasActions.INIT,
          data: {
            image: base64Image,
            width: roomData.canvas.width,
            height: roomData.canvas.height,
          },
        }),
      );
    }
  },
  message(ws, message) {
    const { roomId } = ws.data.params;
    const { action, toolType, toolSize, strokeColor } = message;
    const { x1, y1, x2, y2 } = message;
    const canvas = rooms.find((room) => room.id === roomId)?.canvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (action === CanvasActions.DRAW) {
        ctx.lineWidth = toolSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (toolType === CanvasTools.PEN) {
          ctx.strokeStyle = strokeColor;
          ctx.globalCompositeOperation = 'source-over';
        } else if (toolType === CanvasTools.ERASER) {
          ctx.globalCompositeOperation = 'destination-out';
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
});

