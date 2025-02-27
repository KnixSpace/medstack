import { v4 as uuidV4 } from "uuid";
import { userRole } from "../constants/auth.js";
import { createUser } from "../db/user.js";
import { createInvite, updateInvite } from "../db/invite.js";
import { sendClientInvitationEmail } from "../emails/invite.js";
import { createJwtToken } from "../utils/jwt.js";
import { hashPassword } from "../utils/password.js";

export const addNewInvite = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;
  const { clientEmail } = ctx.state.shared;

  const invite = {
    inviteId: uuidV4(),
    ownerId,
    clientEmail,
    role: userRole.editor,
    isAccepted: false,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createInvite(invite);

  const token = createJwtToken(
    {
      inviteId: invite.inviteId,
    },
    process.env.JWT_CLIENT_INVITE_KEY,
    "2m"
  );
  const invitationLink = `${process.env.BACKEND_URL}/api/v1/invite/accept/${token}`;
  await sendClientInvitationEmail(clientEmail, { invitationLink });

  ctx.status = 201;
  ctx.body = { message: "invite send successfully" };
};

export const acceptInvite = async (ctx) => {
  const {
    inviteId,
    name,
    password,
    role,
    ownerId,
    clientEmail: email,
  } = ctx.state.shared;

  const editor = {
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
  await createUser(editor);
  await updateInvite(inviteId, { isAccepted: true });
  
  const token = createJwtToken(
    { userId: editor.userId, role },
    process.env.JWT_PASSWORD_KEY
  );
  ctx.set("Authorization", `Bearer ${token}`);
  ctx.status = 201;
  ctx.body = { message: "login successfully" };
};

export const resendInvite = async (ctx) => {
  const { inviteId, clientEmail } = ctx.state.shared;

  const token = createJwtToken(
    {
      inviteId,
    },
    process.env.JWT_CLIENT_INVITE_KEY,
    "2m"
  );
  const invitationLink = `${process.env.BACKEND_URL}/api/v1/invite/accept/${token}`;
  await sendClientInvitationEmail(clientEmail, { invitationLink });

  ctx.body = { message: "invite send successfully" };
};
