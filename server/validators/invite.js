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
  const { inviteId } = ctx.state.shared;

  if (inviteId === undefined) return;

  if (!validateUuid(inviteId)) {
    errors.push(buildPropertyError("params", "invalid invite id"));
    return;
  }

  const invite = await readInvite({ inviteId });
  if (!invite) {
    errors.push(buildPropertyError("params", "invalid invite"));
  } else {
    ctx.state.shared = Object.assign(invite, ctx.state.shared);
  }
};

export const validateInviteAccepted = async (ctx, errors) => {
  if (ctx.state.shared?.isAccepted === undefined) return;

  if (ctx.state.shared.isAccepted) {
    errors.push(buildPropertyError("invite", "invite already accepted"));
  }
};

export const validateInviteClientEmail = async (ctx, errors) => {
  const { clientEmail } = ctx.request.body;

  if (clientEmail === undefined) {
    errors.push(buildPropertyError("clientEmail", "client email is required"));
  } else if (!isValidEmail(clientEmail)) {
    errors.push(buildPropertyError("clientEmail", "not a valid email"));
  } else if (
    (await readInvite({ clientEmail })) ||
    (await readUser({ email: clientEmail }))
  ) {
    errors.push(buildPropertyError("clientEmail", "email already exists"));
  } else {
    ctx.state.shared = Object.assign(
      { clientEmail: clientEmail.trim() },
      ctx.state.shared
    );
  }
};

export const validateInviteClientName = async (ctx, errors) => {
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
    ctx.state.shared = Object.assign({ name: name.trim() }, ctx.state.shared);
  }
};

export const validateInviteClientPassword = (ctx, errors) => {
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
