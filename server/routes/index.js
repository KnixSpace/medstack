import serverRoutes from "./server.js";
import userRoutes from "./user.js";
import authRoutes from "./auth.js";
import spaceRoutes from "./space.js";
import inviteRoutes from "./invite.js";
import threadRoutes from "./thread.js";
import geminiRoutes from "./gemini.js";

export const routes = (app) => {
  const allRoutes = [
    serverRoutes,
    userRoutes,
    authRoutes,
    spaceRoutes,
    inviteRoutes,
    threadRoutes,
    geminiRoutes,
  ];

  allRoutes.forEach((route) => {
    app.use(route.routes());
  });
};
