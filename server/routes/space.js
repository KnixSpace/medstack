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
  getSpaceThreads,
  getUserSubscriptionStatus,
  getSuggestedSpaces,
  subscribeMultipleSpaces,
} from "../controllers/index.js";
import {
  validateSpaceOwner,
  validateSpaceDescription,
  validateSpaceModificationData,
  validateSpacePrivacy,
  validateSpaceTitle,
  validateSpaceId,
  validateSpaceSubscription,
  validateSpaceCoverImage,
} from "../validators/space.js";
import { validateOwnerId } from "../validators/auth.js";
import {
  validateThreadQueryParameters,
  validateThreadQueryTags,
} from "../validators/thread.js";
import { validate } from "../utils/validate.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
import { validatePagination } from "../validators/miscellaneous.js";
const router = new Router({ prefix: "/api/v1/space" });

router.post(
  "/create",
  isAuthenticated("O"),
  validate([
    validateSpaceTitle,
    validateSpaceDescription,
    validateSpaceCoverImage,
    validateSpacePrivacy,
  ]),
  addNewSpace
);

router.put(
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
  isAuthenticated(),
  validate([validateSpaceId, validateSpaceSubscription]),
  subscribeSpace
);

router.post("/multi/subscribe", isAuthenticated("U"), subscribeMultipleSpaces);

router.post(
  "/unsubscribe/:spaceId",
  isAuthenticated(),
  validate([validateSpaceId, validateSpaceSubscription]),
  unsubscribeSpace
);

router.post(
  "/newsletter/:spaceId",
  isAuthenticated(),
  validate([validateSpaceId, validateSpaceSubscription]),
  toggleSpaceNewsletter
);

router.post("/list/suggested", isAuthenticated(), getSuggestedSpaces);

router.get("/:spaceId", validate([validateSpaceId]), getSpace);

router.get(
  "/list/threads/:spaceId",
  validate([
    validateSpaceId,
    validateThreadQueryParameters,
    validateThreadQueryTags,
    validatePagination,
  ]),
  getSpaceThreads
);

router.get(
  "/stats/subscribers/:spaceId",
  isAuthenticated(),
  validate([
    validateSpaceId,
    validateThreadQueryParameters,
    validatePagination,
  ]),
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

router.get(
  "/subscription/status/:spaceId",
  isAuthenticated(),
  validate([validateSpaceId]),
  getUserSubscriptionStatus
);

router.get("/list/subscribed", isAuthenticated("U"), getUserSubscribedSpaces);

export default router;
