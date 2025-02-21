import {
  addNewSpace,
  getAllSpaces,
  getOwnerSpaces,
  modifySpace,
} from "../controllers/index.js";
import {
  validateSapceOwner,
  validateSpaceDescription,
  validateSpaceModificationData,
  validateSpacePrivacy,
  validateSpaceTitle,
} from "../validators/space.js";
import { validate } from "../utils/validate.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/space" });

//WIP: update to aggregate piplnie for filtered based search
router.get("/", getAllSpaces);

router.get("/owner", isAuthenticated, getOwnerSpaces);

//WIP: get complete space details API

router.post(
  "/",
  isAuthenticated,
  validate([
    validateSpaceTitle,
    validateSpaceDescription,
    validateSpacePrivacy,
  ]),
  addNewSpace
);

router.patch(
  "/:spaceId",
  isAuthenticated,
  validate([validateSapceOwner, validateSpaceModificationData]),
  modifySpace
);

//WIP: delete complete space API

export default router;
