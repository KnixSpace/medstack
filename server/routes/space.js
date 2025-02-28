import {
  addNewSpace,
  getOwnerSpaces,
  modifySpace,
} from "../controllers/index.js";
import {
  validateSpaceOwner,
  validateSpaceDescription,
  validateSpaceModificationData,
  validateSpacePrivacy,
  validateSpaceTitle,
  validateSpaceId,
} from "../validators/space.js";
import { validate } from "../utils/validate.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/space" });

router.get("/owner", isAuthenticated(["O"]), getOwnerSpaces);

router.post(
  "/create",
  isAuthenticated(["O"]),
  validate([
    validateSpaceTitle,
    validateSpaceDescription,
    validateSpacePrivacy,
  ]),
  addNewSpace
);

router.post(
  "/update/:spaceId",
  isAuthenticated(["O"]),
  validate([
    validateSpaceId,
    validateSpaceOwner,
    validateSpaceModificationData,
  ]),
  modifySpace
);

export default router;
