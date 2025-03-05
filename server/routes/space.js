import {
  addNewSpace,
  getSpaceSubscribers,
  modifySpace,
  subscribeSpace,
  toggleSpaceNewsletter,
  unsubscribeSpace,
} from "../controllers/index.js";
import {
  validateSpaceOwner,
  validateSpaceDescription,
  validateSpaceModificationData,
  validateSpacePrivacy,
  validateSpaceTitle,
  validateSpaceId,
  validateSpaceSubscription,
} from "../validators/space.js";
import { validate } from "../utils/validate.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/space" });

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

router.post(
  "/subscribe/:spaceId",
  isAuthenticated(["U"]),
  validate([validateSpaceId, validateSpaceSubscription]),
  subscribeSpace
);

router.get(
  "/subscribe/users/:spaceId",
  isAuthenticated(),
  validate([validateSpaceId]),
  getSpaceSubscribers
);

router.post(
  "/unsubscribe/:spaceId",
  isAuthenticated(["U"]),
  validate([validateSpaceId, validateSpaceSubscription]),
  unsubscribeSpace
);

router.post(
  "/newsletter/:spaceId",
  isAuthenticated(["U"]),
  validate([validateSpaceId, validateSpaceSubscription]),
  toggleSpaceNewsletter
);

export default router;
