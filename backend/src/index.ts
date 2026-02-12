import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { websocketRoutes } from './websocket.routes';
import { httpRoutes } from './http.routes';

const app = new Elysia()
  .use(cors())
  .use(websocketRoutes)
  .use(httpRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

