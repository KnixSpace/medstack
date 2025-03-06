import { isAuthenticated } from "../middlewares/auth.js";
import {
  addNewThread,
  approveToPublishThread,
  getAllPendingReviewThread,
  modifyThread,
  resendToPublishThread,
  sendbackThread,
  toggleThreadInteraction,
  addThreadComment,
  removeThreadComment,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateThreadContent,
  validateThreadEditor,
  validateThreadId,
  validateThreadIsApprovedToPublished,
  validateThreadIsPublished,
  validateThreadModificationData,
  validateThreadOwnership,
  validateThreadSpace,
  validateThreadTags,
  validateThreadTitle,
  validateThreadInteraction,
  validateThreadCommentContent,
  validateThreadCommentId,
  validateThreadCommentOwnership,
  validateThreadParentCommentId,
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

router.post(
  "/like/:threadId",
  isAuthenticated(["U"]),
  validate([
    validateThreadId,
    validateThreadIsPublished,
    validateThreadSpace,
    validateThreadInteraction,
  ]),
  toggleThreadInteraction
);

router.post(
  "/comment/:threadId",
  isAuthenticated(),
  validate([
    validateThreadId,
    validateThreadIsPublished,
    validateThreadSpace,
    validateThreadCommentContent,
  ]),
  addThreadComment
);

router.post(
  "/comment/reply/:threadId",
  isAuthenticated(),
  validate([
    validateThreadId,
    validateThreadIsPublished,
    validateThreadSpace,
    validateThreadCommentContent,
    validateThreadParentCommentId,
  ]),
  addThreadComment
);

router.delete(
  "/comment/:commentId",
  isAuthenticated(),
  validate([validateThreadCommentId, validateThreadCommentOwnership]),
  removeThreadComment
);

export default router;
