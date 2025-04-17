import { isAuthenticated } from "../middlewares/auth.js";
import {
  addNewThread,
  modifyThread,
  sendThreadForApproval,
  requestThreadCorrection,
  publishThread,
  toggleThreadInteraction,
  commentOnThread,
  removeThreadComment,
  getPendingApprovalThreads,
  getThreadDataForEdit,
  getThread,
  getThreadInteractions,
  getThreadComments,
  getThreadCommentReplies,
  getFeaturedThreads,
  getSubscribedSpacesThreads,
  getMyThreads,
  getThreadDataForPreview,
  getOwnersThreads,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateThreadContent,
  validateThreadEditor,
  validateThreadId,
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
  validateThreadCoverImage,
  validateThreadStatus,
} from "../validators/thread.js";

import Router from "@koa/router";
import { validatePagination } from "../validators/miscellaneous.js";
const router = new Router({ prefix: "/api/v1/thread" });

router.post(
  "/create",
  isAuthenticated("E"),
  validate([
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadTitle,
    validateThreadContent,
    validateThreadTags,
    validateThreadCoverImage,
  ]),
  addNewThread
);

router.put(
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
  "/send-for-approval/:threadId",
  isAuthenticated("E"),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadStatus,
  ]),
  sendThreadForApproval
);

router.post(
  "/request-correction/:threadId",
  isAuthenticated("O"),
  validate([
    validateThreadId,
    validateThreadSpace,
    validateThreadOwnership,
    validateThreadEditor,
  ]),
  requestThreadCorrection
);

router.post(
  "/publish/:threadId",
  isAuthenticated("O"),
  validate([validateThreadId, validateThreadSpace, validateThreadOwnership]),
  publishThread
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
  commentOnThread
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
  commentOnThread
);

router.delete(
  "/comment/:commentId",
  isAuthenticated(),
  validate([validateThreadCommentId, validateThreadCommentOwnership]),
  removeThreadComment
);

router.get("/list/owner/:ownerId", getOwnersThreads);

router.get("/list/my-threads", isAuthenticated("E", "O"), getMyThreads);

router.get(
  "/list/pending-approval",
  isAuthenticated("O", "E"),
  getPendingApprovalThreads
);

router.get(
  "/details/edit/:threadId",
  isAuthenticated("E", "O"),
  validate([validateThreadId]),
  getThreadDataForEdit
);

router.get(
  "/details/preview/:threadId",
  isAuthenticated("E", "O"),
  validate([validateThreadId]),
  getThreadDataForPreview
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
  "/list/comment/replies/:threadId",
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
