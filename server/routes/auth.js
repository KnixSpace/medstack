import {
  getUser,
  isUserLoggedIn,
  login,
  logout,
  register,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateEmailVerified,
  validateLoginEmail,
  validateLoginPassword,
  validateRegisterEmail,
  validateRegisterName,
  validateRegisterPassword,
  validateRegisterRole,
  validateResendVerificationEmail,
} from "../validators/auth.js";
import { isValidCredentials } from "../middlewares/auth.js";

import Router from "@koa/router";
const router = new Router({ prefix: "/api/v1/auth" });

router.post(
  "/register",
  validate([
    validateRegisterName,
    validateRegisterEmail,
    validateRegisterPassword,
    validateRegisterRole,
  ]),
  register
);

router.post(
  "/login",
  validate([validateLoginEmail, validateLoginPassword]),
  isValidCredentials,
  login
);

router.post("/logout", logout);

router.get(
  "/verify-email/:token",
  validate([validateEmailVerified]),
  verifyEmail
);

router.post(
  "/resend-verification-email",
  validate([validateResendVerificationEmail]),
  resendVerificationEmail
);

router.get("/user", getUser);

router.get("/verify", isUserLoggedIn);

export default router;
