import { readUser } from "../db/user.js";
import { verifyJwt } from "../utils/jwt.js";
import { verifyPassword } from "../utils/password.js";

export const isValidCredentials = async (ctx, next) => {
  const { email, password } = ctx.state.shared;

  const user = await readUser({ email });
  if (!user || !(await verifyPassword(password, user.password))) {
    ctx.status = 401;
    ctx.body = { message: "invalid credentials" };
    return;
  }

  if (!user.isVerified) {
    ctx.status = 401;
    ctx.body = { message: "not verified user" };
    return;
  }

  delete user.password;

  ctx.state.shared = user;
  return next();
};

export const isAuthenticated =
  (roles = null) =>
  async (ctx, next) => {
    const token = ctx.headers?.authorization?.split(" ")[1];
    const data = verifyJwt(token, process.env.JWT_PASSWORD_KEY);

    if (!data) {
      ctx.status = 401;
      ctx.body = { message: "unauthorized" };
      return;
    }

    if (roles != null && !roles.includes(data.role)) {
      ctx.status = 401;
      ctx.body = { message: "unauthorized" };
      return;
    }

    const user = await readUser(
      { userId: data.userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      ctx.status = 401;
      ctx.body = { message: "unauthorized" };
      return;
    }

    ctx.request.user = user;
    return next();
  };
