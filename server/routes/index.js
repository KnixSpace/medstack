import serverRoutes from "./server.js";
import authRoutes from "./auth.js";
import spaceRoutes from "./space.js";
import inviteRoutes from "./invite.js";
import threadRoutes from "./thread.js";

export const routes = (app) => {
  const allRoutes = [
    serverRoutes,
    authRoutes,
    spaceRoutes,
    inviteRoutes,
    threadRoutes,
  ];

  allRoutes.forEach((route) => {
    app.use(route.routes());
  });
};
