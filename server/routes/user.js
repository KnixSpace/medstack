import { isAuthenticated } from "../middlewares/auth.js";
import {
  completeOnboarding,
  getEditorOwnerInfo,
  getMyProfile,
  getPublicProfile,
  saveTags,
  updateProfileData,
} from "../controllers/index.js";

import Router from "@koa/router";
import { validate } from "../utils/validate.js";
import {
  validateUserId,
  validateIsOwner,
  validateUserModificationData,
} from "../validators/user.js";

const router = new Router({ prefix: "/api/v1/user" });

router.post("/onboarding", isAuthenticated("O", "U"), completeOnboarding);

router.post("/selected/tags", isAuthenticated(), saveTags);

router.get("/me", isAuthenticated(), getMyProfile);

router.get(
  "/public-profile/:userId",
  validate([validateUserId, validateIsOwner]),
  getPublicProfile
);

router.get("/editor/owner-info", isAuthenticated("E"), getEditorOwnerInfo);

router.post(
  "/update",
  isAuthenticated(),
  validate([validateUserModificationData]),
  updateProfileData
);

export default router;
