import Router from "@koa/router";
import { getUserSubscribedSpaces } from "../controllers/index.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = new Router({ prefix: "/api/v1/user" });

router.get("/subscriptions", isAuthenticated(["U"]), getUserSubscribedSpaces);

export default router;
