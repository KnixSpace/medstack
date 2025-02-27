import {
  acceptInvite,
  addNewInvite,
  resendInvite,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateInviteAccepted,
  validateInviteClientEmail,
  validateInviteClientName,
  validateInviteClientPassword,
  validateInviteId,
  validateInviteToken,
} from "../validators/invite.js";
import { isAuthenticated } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/invite" });

router.post(
  "/create",
  isAuthenticated(["O"]),
  validate([validateInviteClientEmail]),
  addNewInvite
);

router.post(
  "/accept/:inviteToken",
  validate([
    validateInviteToken,
    validateInviteId,
    validateInviteAccepted,
    validateInviteClientName,
    validateInviteClientPassword,
  ]),
  acceptInvite
);

router.post(
  "/resend/:inviteToken",
  validate([validateInviteToken, validateInviteId, validateInviteAccepted]),
  resendInvite
);

export default router;
