import serverRoutes from "./server.js";
import authRoutes from "./auth.js";
import spaceRoutes from "./space.js";

export const routes = (app) => {
  const allRoutes = [serverRoutes, authRoutes, spaceRoutes];

  allRoutes.forEach((route) => {
    app.use(route.routes());
  });
};
