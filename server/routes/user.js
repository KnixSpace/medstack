import Router from "@koa/router";
import {
  getNamesOfOwnerSpaces,
  getOwnerSpacesWithSubscribersCount,
  getUserSubscribedSpaces,
} from "../controllers/index.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = new Router({ prefix: "/api/v1/user" });

router.get("/subscriptions", isAuthenticated("U"), getUserSubscribedSpaces);

router.get(
  "/owner/spaces",
  isAuthenticated("O"),
  getOwnerSpacesWithSubscribersCount
);
router.get("/owner/spaces/name", isAuthenticated("E"), getNamesOfOwnerSpaces);

export default router;
