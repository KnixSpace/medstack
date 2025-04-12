import { validate as validateUuid } from "uuid";
import { readInvite } from "../db/invite.js";
import { buildPropertyError } from "../utils/validate.js";
import { isValidEmail, isValidPassword } from "./common.js";
import { readUser } from "../db/user.js";
import { decodeJwt, verifyJwt } from "../utils/jwt.js";

export const validateInviteToken = async (ctx, errors) => {
  const { inviteToken } = ctx.params;

  if (ctx.url.includes("accept") || ctx.url.includes("verify")) {
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
  if (ctx.url.includes("accept") || ctx.url.includes("verify")) {
    if (!ctx.state.shared?.inviteId) return;
  }

  const inviteId = ctx.params?.inviteId || ctx.state.shared?.inviteId;

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

export const validateInviteUsersEmails = async (ctx, errors) => {
  const { emails } = ctx.request.body;

  if (!Array.isArray(emails)) {
    errors.push(buildPropertyError("emails", "emails must be an array"));
    return;
  }
  if (emails.length < 1) {
    errors.push(buildPropertyError("emails", "emails must not be empty"));
    return;
  }
  if (emails.length > 5) {
    errors.push(buildPropertyError("emails", "emails must not exceed 5"));
    return;
  }
  if (emails.some((email) => typeof email !== "string")) {
    errors.push(buildPropertyError("emails", "emails must be strings"));
    return;
  }
  if (emails.some((email) => email.trim().length < 1)) {
    errors.push(buildPropertyError("emails", "emails must not be empty"));
    return;
  }
  if (emails.some((email) => email.trim().length > 100)) {
    errors.push(buildPropertyError("emails", "emails must not exceed 100"));
    return;
  }
  if (emails.some((email) => !isValidEmail(email))) {
    errors.push(buildPropertyError("emails", "emails are not valid"));
    return;
  }

  if (
    (await readUser({ email: { $in: emails } })) ||
    (await readInvite({ userEmail: { $in: emails } }))
  ) {
    errors.push(buildPropertyError("emails", "emails already exists"));
    return;
  }

  ctx.state.shared = Object.assign(
    { emails: emails.map((email) => email.trim()) },
    ctx.state.shared
  );
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
