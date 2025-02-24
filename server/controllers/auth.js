import { v4 as uuidV4 } from "uuid";

import { hashPassword } from "../utils/password.js";
import { createJwtToken } from "../utils/jwt.js";
import { createUser, updateUser } from "../db/user.js";
import { sendEmailVerification } from "../emails/auth.js";

export const register = async (ctx) => {
  const { name, email, password, role, subscribedTags } = ctx.state.user;

  const user = {
    userId: uuidV4(),
    name,
    email,
    password: await hashPassword(password),
    role,
    subscribedTags: subscribedTags ? subscribedTags : [],
    isVerified: false,
    createdOn: new Date(),
    updatedOn: new Date(),
  };

  await createUser(user);

  const token = createJwtToken(
    { userId: user.userId },
    process.env.JWT_VERIFY_USER_KEY
  );
  const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${token}`;
  await sendEmailVerification(email, { verificationLink, userName: user.name });

  ctx.status = 201;
  ctx.body = { message: "register successfully" };
};

export const login = async (ctx) => {
  const { userId, role } = ctx.state.user;

  const token = createJwtToken({ userId, role }, process.env.JWT_PASSWORD_KEY);

  ctx.status = 201;
  ctx.set("Authorization", `Bearer ${token}`);
  ctx.body = { message: "login successfully" };
};

export const verifyEmail = async (ctx) => {
  const { userId } = ctx.state.user;

  await updateUser(userId, {
    isVerified: true,
  });

  ctx.status = 200;
  ctx.body = { message: "email verified" };
};
