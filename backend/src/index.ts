import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { websocketRoutes } from "./websocket.routes";
import { httpRoutes } from "./http.routes";

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:5173", "http://192.168.18.201:5173"],
      credentials: true,
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  )
  .use(websocketRoutes)
  .use(httpRoutes)
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

