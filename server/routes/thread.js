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
  getThread,
  getThreadInteractions,
  getThreadComments,
  getThreadCommentReplies,
  getFeaturedThreads,
  getSubscribedSpacesThreads,
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
  validateThreadQueryTags,
  validateThreadQueryParameters,
} from "../validators/thread.js";

import Router from "@koa/router";
import { validatePagination } from "../validators/miscellaneous.js";
const router = new Router({ prefix: "/api/v1/thread" });

router.post(
  "/create/:spaceId",
  isAuthenticated("E"),
  validate([
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadTitle,
    validateThreadContent,
    validateThreadTags,
  ]),
  addNewThread
);

router.get(
  "/list/pending-review",
  isAuthenticated("O", "E"),
  getAllPendingReviewThread
);

router.post(
  "/publish/:threadId",
  isAuthenticated("O"),
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
  isAuthenticated("O"),
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
  isAuthenticated("E"),
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
  isAuthenticated("E"),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadIsApprovedToPublished,
  ]),
  resendToPublishThread
);

router.post(
  "/interact/:threadId",
  isAuthenticated(),
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

router.get("/details/:threadId", validate([validateThreadId]), getThread);

router.get(
  "/list/comments/:threadId",
  validate([
    validateThreadId,
    validateThreadQueryParameters,
    validatePagination,
  ]),
  getThreadComments
);

router.get(
  "/list/reply/:threadId",
  validate([
    validateThreadId,
    validateThreadParentCommentId,
    validateThreadQueryParameters,
    validatePagination,
  ]),
  getThreadCommentReplies
);

router.get(
  "/stats/interactions/:threadId",
  isAuthenticated(),
  validate([
    validateThreadId,
    validateThreadQueryParameters,
    validatePagination,
  ]),
  getThreadInteractions
);

router.get(
  "/list/featured",
  validate([
    validateThreadQueryParameters,
    validateThreadQueryTags,
    validatePagination,
  ]),
  getFeaturedThreads
);

router.get(
  "/list/personalized",
  isAuthenticated("U"),
  validate([validateThreadQueryParameters, validatePagination]),
  getSubscribedSpacesThreads
);

export default router;
