import { t, Elysia } from "elysia";
import { boardRoutes } from "./board.routes";
import { userRoutes } from "./user.routes";


export const httpRoutes = new Elysia()
  .use(userRoutes)
  .use(boardRoutes);

