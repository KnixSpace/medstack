import {
  addNewSpace,
  modifySpace,
  subscribeSpace,
  unsubscribeSpace,
  toggleSpaceNewsletter,
  getSpace,
  getSpaceSubscribers,
  getUserSubscribedSpaces,
  getNamesOfOwnerSpaces,
  getOwnerSpacesWithSubscribersCount,
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
import { validateOwnerId } from "../validators/auth.js";
import { validate } from "../utils/validate.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/space" });

router.post(
  "/create",
  isAuthenticated("O"),
  validate([
    validateSpaceTitle,
    validateSpaceDescription,
    validateSpacePrivacy,
  ]),
  addNewSpace
);

router.post(
  "/update/:spaceId",
  isAuthenticated("O"),
  validate([
    validateSpaceId,
    validateSpaceOwner,
    validateSpaceModificationData,
  ]),
  modifySpace
);

router.post(
  "/subscribe/:spaceId",
  isAuthenticated("U"),
  validate([validateSpaceId, validateSpaceSubscription]),
  subscribeSpace
);

router.post(
  "/unsubscribe/:spaceId",
  isAuthenticated("U"),
  validate([validateSpaceId, validateSpaceSubscription]),
  unsubscribeSpace
);

router.post(
  "/newsletter/:spaceId",
  isAuthenticated("U"),
  validate([validateSpaceId, validateSpaceSubscription]),
  toggleSpaceNewsletter
);

router.get("/details/:spaceId", validate([validateSpaceId]), getSpace);

router.get(
  "/stats/subscribers/:spaceId",
  isAuthenticated(),
  validate([validateSpaceId]),
  getSpaceSubscribers
);

router.get(
  "/list/owned-names/:ownerId",
  validate([validateOwnerId]),
  getNamesOfOwnerSpaces
);

router.get(
  "/list/owned-with-subscribers/:ownerId",
  validate([validateOwnerId]),
  getOwnerSpacesWithSubscribersCount
);

router.get("/list/subscribed", isAuthenticated("U"), getUserSubscribedSpaces);

export default router;
