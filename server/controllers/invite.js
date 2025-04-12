import { v4 as uuidV4 } from "uuid";
import { userRole } from "../constants/enums.js";
import { createUser, deleteEditor } from "../db/user.js";
import {
  createInvite,
  readAllInvites,
  updateInvite,
  deleteInvite,
  readInvitedEditors,
} from "../db/invite.js";
import { sendInvitationEmail } from "../emails/invite.js";
import { createJwtInvitationLink, generateJwt } from "../utils/jwt.js";
import { hashPassword } from "../utils/password.js";
import Bluebird from "bluebird";

export const addNewInvites = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;
  const { emails } = ctx.state.shared;

  const invites = emails.map((email) => {
    return {
      inviteId: uuidV4(),
      ownerId,
      userEmail: email,
      role: userRole.editor,
      isAccepted: false,
      createdOn: new Date(),
      updatedOn: new Date(),
    };
  });
  await createInvite(invites);
  await Bluebird.map(invites, async (invite) => {
    const invitationLink = createJwtInvitationLink({
      inviteId: invite.inviteId,
    });
    await sendInvitationEmail(invite.userEmail, { invitationLink });
  });

  ctx.status = 201;
  ctx.body = { message: "invite send successfully" };
};

export const acceptInvite = async (ctx) => {
  const { inviteId, role, ownerId, userEmail: email } = ctx.state.invite;
  const { name, password } = ctx.state.shared;

  const user = {
    userId: uuidV4(),
    name,
    email,
    password: await hashPassword(password),
    role,
    isVerified: true,
    ownerId,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createUser(user);
  await updateInvite(inviteId, { isAccepted: true });

  const token = generateJwt(
    { userId: user.userId, role },
    process.env.JWT_PASSWORD_KEY
  );

  ctx.cookies.set("connect.sid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  ctx.status = 201;
  ctx.body = { message: "login successfully" };
};

export const resendInvite = async (ctx) => {
  const { inviteId, userEmail } = ctx.state.invite;

  await updateInvite(inviteId, {});
  const invitationLink = createJwtInvitationLink({ inviteId });
  await sendInvitationEmail(userEmail, { invitationLink });

  ctx.body = { message: "invite send successfully" };
};

export const verifyInvite = async (ctx) => {
  const { isAccepted } = ctx.state.invite;

  ctx.body = {
    message: "invite already accepted",
    data: { isAccepted },
  };
};

export const removeInvite = async (ctx) => {
  const { inviteId } = ctx.state.invite;

  await deleteInvite(inviteId);
  ctx.status = 200;
  ctx.body = { message: "invite deleted successfully" };
};

export const removeEditor = async (ctx) => {
  const { inviteId, userEmail } = ctx.state.invite;

  await deleteInvite(inviteId);
  await deleteEditor(userEmail);
  ctx.status = 200;
  ctx.body = { message: "editor deleted successfully" };
};

export const getPendingInvites = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;
  const invites = await readAllInvites({ ownerId, isAccepted: false });
  ctx.body = { data: invites };
};

export const getInvitedEditors = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;

  const invitedEditors = await readInvitedEditors(ownerId);
  ctx.status = 200;
  ctx.body = {
    message: "invited editors fetched successfully",
    data: invitedEditors,
  };
};
