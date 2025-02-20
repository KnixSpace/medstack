import serverRoutes from "./server.js";

export const routes = (app) => {
  app.use(serverRoutes.routes());
};
