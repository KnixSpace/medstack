import serverRoutes from "./server.js";
import authRoutes from "./auth.js";
import inviteRoutes from "./invite.js";

export const routes = (app) => {
  app.use(serverRoutes.routes());
  app.use(authRoutes.routes());
  app.use(inviteRoutes.routes());
};
