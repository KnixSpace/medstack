import {
  acceptInvite,
  addNewInvite,
  getAllInvites,
  resendInvite,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateInviteAccepted,
  validateInviteUserEmail,
  validateInviteUserName,
  validateInviteUserPassword,
  validateInviteId,
  validateInviteToken,
} from "../validators/invite.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/invite" });

router.get("/", isAuthenticated("O"), getAllInvites);

router.post(
  "/create",
  isAuthenticated("O"),
  validate([validateInviteUserEmail]),
  addNewInvite
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
  "/resend/:inviteToken",
  validate([validateInviteToken, validateInviteId, validateInviteAccepted]),
  resendInvite
);

export default router;
