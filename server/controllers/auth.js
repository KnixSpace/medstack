import { v4 as uuidV4 } from "uuid";

import { hashPassword } from "../utils/password.js";
import { createJwtToken } from "../utils/jwt.js";
import { createUser, updateUser } from "../db/user.js";
import { sendEmailVerification } from "../emails/auth.js";

export const register = async (ctx) => {
  const { name, email, password, role, subscribedTags } = ctx.request.body;

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
  await sendEmailVerification(email, {
    token: createJwtToken(
      { userId: user.userId },
      process.env.JWT_VERIFY_USER_KEY
    ),
    userName: user.name,
  });

  ctx.status = 201;
  ctx.body = { message: "register successfully" };
};

export const login = async (ctx) => {
  const { userId, role } = ctx.request.user;

  const token = createJwtToken({ userId, role }, process.env.JWT_PASSWORD_KEY);

  ctx.status = 201;
  ctx.set("Authorization", `Bearer ${token}`);
  ctx.body = { message: "login successfully" };
};

export const verifyEmail = async (ctx) => {
  const { userId } = ctx.request.user;

  await updateUser(userId, {
    isVerified: true,
  });

  ctx.status = 200;
  ctx.body = { message: "email verified" };
};
