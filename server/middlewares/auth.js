import { userRole } from "../constants/enums.js";
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
  (...roles) =>
  async (ctx, next) => {
    const token = ctx.cookies.get("connect.sid");
    if (!token) {
      ctx.status = 401;
      ctx.body = { message: "unauthorized" };
      return;
    }
    
    const data = verifyJwt(token, process.env.JWT_PASSWORD_KEY);
    if (!data) {
      ctx.status = 401;
      ctx.body = { message: "unauthorized" };
      return;
    }

    if (roles.length && !roles.includes(data.role)) {
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

    if (data.role === userRole.editor) {
      const owner = await readUser({ userId: user.ownerDetails?.ownerId });
      if (!owner) {
        ctx.status = 401;
        ctx.body = { message: "unauthorized" };
        return;
      }
      ctx.state.owner = owner;
    }

    ctx.request.user = user;
    return next();
  };
