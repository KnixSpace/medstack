import { isAuthenticated } from "../middlewares/auth.js";
import {
  addNewThread,
  approveToPublishThread,
  getAllPendingReviewThread,
  modifyThread,
  resendToPublishThread,
  sendbackThread,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateThreadContent,
  validateThreadEditor,
  validateThreadId,
  validateThreadIsApprovedToPublished,
  validateThreadModificationData,
  validateThreadOwnership,
  validateThreadSpace,
  validateThreadTags,
  validateThreadTitle,
} from "../validators/thread.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/thread" });

router.get("/review", isAuthenticated(["O", "E"]), getAllPendingReviewThread);

router.post(
  "/create",
  isAuthenticated(["E"]),
  validate([
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadTitle,
    validateThreadContent,
    validateThreadTags,
  ]),
  addNewThread
);

router.post(
  "/publish/:threadId",
  isAuthenticated(["O"]),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadIsApprovedToPublished,
  ]),
  approveToPublishThread
);

router.post(
  "/revise/:threadId",
  isAuthenticated(["O"]),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadIsApprovedToPublished,
    validateThreadEditor,
  ]),
  sendbackThread
);

router.post(
  "/update/:threadId",
  isAuthenticated(["E"]),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadModificationData,
  ]),
  modifyThread
);

router.post(
  "/resend/:threadId",
  isAuthenticated(["E"]),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadIsApprovedToPublished,
  ]),
  resendToPublishThread
);

export default router;
