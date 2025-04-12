import {
  addNewInvites,
  acceptInvite,
  verifyInvite,
  resendInvite,
  removeInvite,
  getPendingInvites,
  getInvitedEditors,
  removeEditor,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateInviteAccepted,
  validateInviteUsersEmails,
  validateInviteUserName,
  validateInviteUserPassword,
  validateInviteId,
  validateInviteToken,
} from "../validators/invite.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/invite" });

router.post(
  "/create",
  isAuthenticated("O"),
  validate([validateInviteUsersEmails]),
  addNewInvites
);

router.post(
  "/accept/:inviteToken",
  validate([
    validateInviteToken,
    validateInviteId,
    validateInviteAccepted,
    validateInviteUserName,
    validateInviteUserPassword,
  ]),
  acceptInvite
);

router.post(
  "/resend/:inviteId",
  isAuthenticated("O"),
  validate([validateInviteId, validateInviteAccepted]),
  resendInvite
);

router.get(
  "/verify/:inviteToken",
  validate([validateInviteToken, validateInviteId]),
  verifyInvite
);

router.delete(
  "/delete/:inviteId",
  isAuthenticated("O"),
  validate([validateInviteId]),
  removeInvite
);

router.delete(
  "/delete/editor/:inviteId",
  isAuthenticated("O"),
  validate([validateInviteId]),
  removeEditor
);

router.get("/list/pending", isAuthenticated("O"), getPendingInvites);

router.get("/list/invited-editors", isAuthenticated("O"), getInvitedEditors);

export default router;
