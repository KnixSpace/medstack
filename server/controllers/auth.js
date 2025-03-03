import { v4 as uuidV4 } from "uuid";

import { hashPassword } from "../utils/password.js";
import { generateJwt, createJwtEmailVerificationLink } from "../utils/jwt.js";
import { createUser, updateUser } from "../db/user.js";
import { sendEmailVerification } from "../emails/auth.js";
import { frontend } from "../constants/config.js";

export const register = async (ctx) => {
  const { name, email, password, role, subscribedTags } = ctx.state.shared;

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

  const verificationLink = createJwtEmailVerificationLink({
    userId: user.userId,
  });
  await sendEmailVerification(email, { verificationLink, userName: user.name });

  ctx.status = 201;
  ctx.body = { message: "register successfully" };
};

export const login = async (ctx) => {
  const { userId, role } = ctx.state.shared;

  const token = generateJwt({ userId, role }, process.env.JWT_PASSWORD_KEY);

  ctx.status = 201;
  ctx.set("Authorization", `Bearer ${token}`);
  ctx.body = { message: "login successfully" };
};

export const verifyEmail = async (ctx) => {
  const { userId } = ctx.state.shared;

  await updateUser(userId, {
    isVerified: true,
  });

  ctx.redirect(`${frontend}/login`);
};
