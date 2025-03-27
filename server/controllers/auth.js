import { v4 as uuidV4 } from "uuid";

import { hashPassword } from "../utils/password.js";
import {
  generateJwt,
  createJwtEmailVerificationLink,
  decodeJwt,
} from "../utils/jwt.js";
import { createUser, isUser, readUser, updateUser } from "../db/user.js";
import { sendEmailVerification } from "../emails/auth.js";

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
  ctx.body = { message: "register successfully and verification email sent" };
};

export const login = async (ctx) => {
  const { userId, role } = ctx.state.shared;

  const token = generateJwt({ userId, role }, process.env.JWT_PASSWORD_KEY);

  ctx.cookies.set("connect.sid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  ctx.status = 201;
  ctx.body = { message: "login successfully" };
};

export const isUserLoggedIn = async (ctx) => {
  const token = ctx.cookies.get("connect.sid");
  const userData = decodeJwt(token, process.env.JWT_PASSWORD_KEY);

  if (userData?.userId && (await isUser({ userId: userData.userId }))) {
    ctx.body = { message: "user logged in", data: { isLoggedIn: true } };
    return;
  }
  ctx.body = { message: "user not logged in", data: { isLoggedIn: false } };
};

export const getUser = async (ctx) => {
  const token = ctx.cookies.get("connect.sid");
  const userData = decodeJwt(token, process.env.JWT_PASSWORD_KEY);

  if (userData?.userId) {
    const user = await readUser(
      { userId: userData.userId },
      { projection: { _id: 0, password: 0 } }
    );
    ctx.body = { message: "user data found", data: { user } };
    return;
  }
  ctx.body = { message: "user data not found", data: { user: null } };
};

export const verifyEmail = async (ctx) => {
  const { userId } = ctx.state.shared;

  await updateUser(userId, {
    isVerified: true,
  });

  ctx.body = { message: "email verified" };
};

export const resendVerificationEmail = async (ctx) => {
  const { userId, email, name } = ctx.state.shared;

  const verificationLink = createJwtEmailVerificationLink({ userId });
  await sendEmailVerification(email, { verificationLink, userName: name });

  ctx.status = 201;
  ctx.body = { message: "verification email sent" };
};
