import serverRoutes from "./server.js";
import authRoutes from "./auth.js";

export const routes = (app) => {
  app.use(serverRoutes.routes());
  app.use(authRoutes.routes());
};
