import { validate as validateUuid } from "uuid";
import { readInvite } from "../db/invite.js";
import { buildPropertyError } from "../utils/validate.js";
import { isValidEmail, isValidPassword } from "./common.js";
import { readUser } from "../db/user.js";
import { decodeJwt, verifyJwt } from "../utils/jwt.js";

export const validateInviteToken = async (ctx, errors) => {
  const { inviteToken } = ctx.params;

  if (ctx.url.includes("accept")) {
    const data = verifyJwt(inviteToken, process.env.JWT_CLIENT_INVITE_KEY);
    if (!data) {
      errors.push(buildPropertyError("token", "invalid invite token"));
      return;
    }
    ctx.state.shared = { inviteId: data.inviteId };
  } else {
    const data = decodeJwt(inviteToken);
    ctx.state.shared = { inviteId: data.inviteId };
  }
};

export const validateInviteId = async (ctx, errors) => {
  if (ctx.state.shared?.inviteId === undefined) return;

  const { inviteId } = ctx.state.shared;
  if (!validateUuid(inviteId)) {
    errors.push(buildPropertyError("params", "invalid invite id"));
    return;
  }

  const invite = await readInvite({ inviteId });
  if (!invite) {
    errors.push(buildPropertyError("params", "invalid invite"));
  } else {
    ctx.state.invite = invite;
  }
};

export const validateInviteAccepted = async (ctx, errors) => {
  if (ctx.state.invite?.isAccepted === undefined) return;

  if (ctx.state.invite.isAccepted) {
    errors.push(buildPropertyError("invite", "invite already accepted"));
  }
};

export const validateInviteUserEmail = async (ctx, errors) => {
  const { userEmail } = ctx.request.body;

  if (userEmail === undefined) {
    errors.push(buildPropertyError("userEmail", "user email is required"));
  } else if (!isValidEmail(userEmail)) {
    errors.push(buildPropertyError("userEmail", "user email is not valid"));
  } else if (
    (await readInvite({ userEmail })) ||
    (await readUser({ email: userEmail }))
  ) {
    errors.push(buildPropertyError("userEmail", "user already exists"));
  } else {
    ctx.state.shared = Object.assign(
      { userEmail: userEmail.trim() },
      ctx.state.shared
    );
  }
};

export const validateInviteUserName = async (ctx, errors) => {
  if (ctx.state.shared === undefined) return;

  const { name } = ctx.request.body;

  if (name === undefined) {
    errors.push(buildPropertyError("name", "name is required"));
    return;
  } else if (typeof name !== "string") {
    errors.push(buildPropertyError("name", "name must be string"));
    return;
  }

  const sanitizedName = name.trim();
  if (sanitizedName.split(/\s+/).length > 1) {
    errors.push(buildPropertyError("name", "no space should be in name"));
    return;
  }

  if (sanitizedName.length < 1 || sanitizedName.length > 24) {
    errors.push(
      buildPropertyError("name", "name must be of 1 to 24 characters")
    );
    return;
  }

  ctx.state.shared = Object.assign({ name: sanitizedName }, ctx.state.shared);
};

export const validateInviteUserPassword = (ctx, errors) => {
  if (ctx.state.shared === undefined) return;

  const { password } = ctx.request.body;

  if (password === undefined) {
    errors.push(buildPropertyError("password", "password is required"));
  } else if (typeof password !== "string" || !isValidPassword(password)) {
    errors.push(buildPropertyError("password", "password is not valid"));
  } else {
    ctx.state.shared = Object.assign(
      { password: password.trim() },
      ctx.state.shared
    );
  }
};
