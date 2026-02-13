import { t, Elysia } from 'elysia';
import { CanvasActions, CanvasTools, RoomData } from './types';
import { rooms } from './rooms';
import { Canvas } from 'canvas';

export const httpRoutes = new Elysia()
  .get('/rooms', () => {
    const roomsData = rooms.map(({ id, name, canvas }) => ({
      id,
      name,
      width: canvas.width,
      height: canvas.height,
    }));
    return JSON.stringify(roomsData);
  })
  .get('/room/:roomId/info', ({ params, set }) => {
    const { roomId } = params;
    const roomInfo = rooms.find((room) => room.id === roomId);
    if (!roomInfo) {
      set.status = 404;
      return null;
    }
    return {
      id: roomInfo.id,
      name: roomInfo.name,
      width: roomInfo.canvas.width,
      height: roomInfo.canvas.height,
    };
  })
  .post(
    '/room/create',
    ({ body, set }) => {
      try {
        const { name, width, height } = body;
        const newRoom: RoomData = {
          id: crypto.randomUUID(),
          name,
          canvas: new Canvas(width || 1600, height || 900),
        };
        rooms.push(newRoom);
        return newRoom.id;
      } catch (error) {
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
    },
  );

