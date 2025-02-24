import { userRole } from "../constants/auth.js";
import { readUser } from "../db/user.js";
import { verfyJwtToken } from "../utils/jwt.js";
import { isValidEmail, isValidPassword, isValidRole } from "./common.js";
import { buildPropertyError } from "../utils/validate.js";

export const validateRegisterName = (ctx, errors) => {
  const { name } = ctx.request.body;

  if (name === undefined) {
    errors.push(buildPropertyError("name", "name is required"));
  } else if (typeof name !== "string") {
    errors.push(buildPropertyError("name", "name must be string"));
  } else if (name.trim().length < 1 || name.trim().length > 25) {
    errors.push(
      buildPropertyError("name", "name must be of 1 to 25 characters")
    );
  } else {
    ctx.state.user = Object.assign({ name: name.trim() }, ctx.state.user);
  }
};

export const validateRegisterEmail = async (ctx, errors) => {
  const { email } = ctx.request.body;

  if (email === undefined) {
    errors.push(buildPropertyError("email", "email is required"));
  } else if (
    typeof email !== "string" ||
    email.trim().length > 50 ||
    !isValidEmail(email)
  ) {
    errors.push(buildPropertyError("email", "email is not valid"));
  } else if (
    await readUser(
      { email: email.trim() },
      { projection: { password: 0, name: 0, _id: 0 } }
    )
  ) {
    errors.push(buildPropertyError("email", "email is already exists"));
  } else {
    ctx.state.user = Object.assign({ email: email.trim() }, ctx.state.user);
  }
};

export const validateRegisterPassword = (ctx, errors) => {
  const { password } = ctx.request.body;

  if (password === undefined) {
    errors.push(buildPropertyError("password", "password is required"));
  } else if (typeof password !== "string" || !isValidPassword(password)) {
    errors.push(buildPropertyError("password", "password is not valid"));
  } else {
    ctx.state.user = Object.assign(
      { password: password.trim() },
      ctx.state.user
    );
  }
};

export const validateRegisterRole = (ctx, errors) => {
  const { role } = ctx.request.body;

  if (role === undefined) {
    errors.push(buildPropertyError("role", "role is required"));
  } else if (!isValidRole(userRole, role)) {
    errors.push(buildPropertyError("role", "role is not a valid"));
  } else {
    ctx.state.user = Object.assign({ role }, ctx.state.user);
  }
};

export const validateLoginEmail = (ctx, errors) => {
  const { email } = ctx.request.body;

  if (email === undefined) {
    errors.push(buildPropertyError("email", "email is required"));
  } else if (
    typeof email !== "string" ||
    email.trim().length > 50 ||
    !isValidEmail(email)
  ) {
    errors.push(buildPropertyError("email", "email is not valid"));
  } else {
    ctx.state.user = Object.assign({ email: email.trim() }, ctx.state.user);
  }
};

export const validateLoginPassword = (ctx, errors) => {
  const { password } = ctx.request.body;
  if (password === undefined) {
    errors.push(buildPropertyError("password", "password is required"));
  } else {
    ctx.state.user = Object.assign(
      { password: password.trim() },
      ctx.state.user
    );
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

  ctx.state.user = { userId: data.userId };
};
