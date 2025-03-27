import { v4 as uuidV4 } from "uuid";
import { userRole } from "../constants/enums.js";
import { createUser } from "../db/user.js";
import { createInvite, readAllInvites, updateInvite } from "../db/invite.js";
import { sendInvitationEmail } from "../emails/invite.js";
import { createJwtInvitationLink, generateJwt } from "../utils/jwt.js";
import { hashPassword } from "../utils/password.js";

export const getAllInvites = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;
  const invites = await readAllInvites({ ownerId });
  ctx.body = invites;
};

export const addNewInvite = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;
  const { userEmail } = ctx.state.shared;

  const invite = {
    inviteId: uuidV4(),
    ownerId,
    userEmail,
    role: userRole.editor,
    isAccepted: false,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createInvite(invite);

  const invitationLink = createJwtInvitationLink({ inviteId: invite.inviteId });
  await sendInvitationEmail(userEmail, { invitationLink });

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
    ownerDetails: { ownerId },
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

  const invitationLink = createJwtInvitationLink({ inviteId });
  await sendInvitationEmail(userEmail, { invitationLink });

  ctx.body = { message: "invite send successfully" };
};
