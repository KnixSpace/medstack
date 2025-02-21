import { userRole } from "../constants/auth.js";
import { readUser } from "../db/user.js";
import { verfyJwtToken } from "../utils/jwt.js";
import { isValidEmail, isValidPassword, isValidRole } from "./common.js";
import { buildPropertyError } from "../utils/validate.js";

export const validateRegisterName = (ctx, errors) => {
  const { name } = ctx.request.body;

  if (name === undefined) {
    errors.push(buildPropertyError("name", "name is required"));
    return;
  } else if (typeof name !== "string") {
    errors.push(buildPropertyError("name", "name must be string"));
    return;
  } else if (name.trim().length < 1 || name.trim().length > 25) {
    errors.push(
      buildPropertyError("name", "name must be of 1 to 25 characters")
    );
    return;
  }
};

export const validateRegisterEmail = async (ctx, errors) => {
  const { email } = ctx.request.body;

  if (email === undefined) {
    errors.push(buildPropertyError("email", "email is required"));
    return;
  } else if (
    typeof email !== "string" ||
    email.trim().length > 50 ||
    !isValidEmail(email)
  ) {
    errors.push(buildPropertyError("email", "email is not valid"));
    return;
  } else if (
    await readUser({ email }, { projection: { password: 0, name: 0, _id: 0 } })
  ) {
    errors.push(buildPropertyError("email", "email is already exists"));
    return;
  }
};

export const validateRegisterPassword = (ctx, errors) => {
  const { password } = ctx.request.body;

  if (password === undefined) {
    errors.push(buildPropertyError("password", "password is required"));
    return;
  } else if (typeof password !== "string" || !isValidPassword(password)) {
    errors.push(buildPropertyError("password", "password is not valid"));
    return;
  }
};

export const validateRegisterRole = (ctx, errors) => {
  const { role } = ctx.request.body;

  if (role === undefined) {
    errors.push(buildPropertyError("role", "role is required"));
    return;
  } else if (!isValidRole(userRole, role)) {
    errors.push(buildPropertyError("role", "role is not a valid"));
    return;
  }
};

export const validateLoginEmail = (ctx, errors) => {
  const { email } = ctx.request.body;

  if (email === undefined) {
    errors.push(buildPropertyError("email", "email is required"));
    return;
  } else if (
    typeof email !== "string" ||
    email.trim().length > 50 ||
    !isValidEmail(email)
  ) {
    errors.push(buildPropertyError("email", "email is not valid"));
    return;
  }
};

export const validateLoginPassword = (ctx, errors) => {
  const { password } = ctx.request.body;
  if (password === undefined) {
    errors.push(buildPropertyError("password", "password is required"));
    return;
  }
};

export const validateEmailVerified = async (ctx, errors) => {
  const { token } = ctx.params;

  const data = verfyJwtToken(token, process.env.JWT_VERIFY_USER_KEY);
  if (!data) {
    errors.push(buildPropertyError("invalid", "invalid token"));
    return;
  }

  const user = await readUser(
    { userId: data.userId },
    { projection: { isVerified: 1 } }
  );

  if (!user) {
    errors.push(buildPropertyError("invalid", "user not found"));
    return;
  }

  if (user.isVerified) {
    errors.push(buildPropertyError("invalid", "user is already verified"));
    return;
  }

  ctx.request.user = { userId: data.userId };
};
