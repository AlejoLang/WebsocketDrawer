import { Canvas, createCanvas } from 'canvas';
import { t, Elysia } from 'elysia';
import { CanvasTools, CanvasActions } from './types';

const sessions = new Map<string, Canvas>();

const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .ws('/canvas/:room', {
    params: t.Object({
      room: t.String(),
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
      const { room } = ws.data.params;
      console.log('Connected');
      if (!sessions.has(room)) {
        const canvas = createCanvas(1600, 900);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1600, 900);
        sessions.set(room, canvas);
      }
      ws.subscribe(room);
      const canvas = sessions.get(room);
      if (canvas) {
        const base64Image = canvas.toBuffer('image/png').toString('base64');
        ws.send(
          JSON.stringify({
            type: CanvasActions.INIT,
            data: base64Image,
          }),
        );
      }
    },
    message(ws, message) {
      const { room } = ws.data.params;
      const { action, toolType, toolSize, strokeColor } = message;
      const { x1, y1, x2, y2 } = message;
      const canvas = sessions.get(room);
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
          ws.publish(room, m);
        } else if (action === CanvasActions.CLEAR) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const m = {
            type: CanvasActions.CLEAR,
          };
          ws.publish(room, m);
        }
      }
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

