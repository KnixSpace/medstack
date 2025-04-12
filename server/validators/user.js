import { readUser } from "../db/user.js";
import { buildPropertyError } from "../utils/validate.js";
import { isValidImageUrl } from "./common.js";

export const validateUserId = async (ctx, errors) => {
  const userId = ctx.request.params.userId;

  if (!userId) {
    errors.push(buildPropertyError("userId", "userId is required"));
    return;
  }

  const user = await readUser(
    { userId },
    {
      projection: {
        _id: 0,
        password: 0,
        isVerified: 0,
        updatedOn: 0,
        onboardComplete: 0,
      },
    }
  );

  if (!user) {
    errors.push(buildPropertyError("userId", "userId not found"));
    return;
  }

  ctx.state.user = Object.assign(user, ctx.state.user);
};

export const validateIsOwner = (ctx, errors) => {
  if (!ctx.state.user.userId) return;

  const user = ctx.state.user;

  if (user.role !== "O") {
    errors.push(buildPropertyError("userId", "userId not found"));
    return;
  }
};

export const validateUserName = (ctx, errors) => {
  const { name } = ctx.request.body;

  if (typeof name !== "string") {
    errors.push(buildPropertyError("name", "name must be string"));
    return;
  }

  const sanitizedName = name.trim();
  if (sanitizedName.split(/\s+/).length > 1) {
    errors.push(buildPropertyError("name", "no space should be in name"));
    return;
  }

  if (sanitizedName.length < 1 || sanitizedName.length > 24) {
    errors.push(
      buildPropertyError("name", "name must be of 1 to 24 characters")
    );
    return;
  }

  ctx.state.shared = Object.assign({ name: sanitizedName }, ctx.state.shared);
};

export const validateUserBio = (ctx, errors) => {
  const { bio } = ctx.request.body;

  if (ctx.request.url.includes("update") && bio.trim() === "") return;

  if (typeof bio !== "string") {
    errors.push(buildPropertyError("bio", "bio must be string"));
    return;
  }

  const sanitizedBio = bio.trim();
  if (
    sanitizedBio.split(/\s+/).length < 2 ||
    sanitizedBio.split(/\s+/).length > 24
  ) {
    errors.push(buildPropertyError("bio", "bio must be of 4 to 64 words"));
    return;
  }

  ctx.state.shared = Object.assign({ bio: sanitizedBio }, ctx.state.shared);
};

export const validateUserProfileImage = (ctx, errors) => {
  const { avatar } = ctx.request.body;
  if (!avatar) return;

  if (typeof avatar !== "string") {
    errors.push(
      buildPropertyError("profileImage", "profileImage must be string")
    );
    return;
  }

  const sanitizedProfileImage = avatar.trim();
  if (!isValidImageUrl(sanitizedProfileImage)) {
    errors.push(buildPropertyError("profileImage", "invalid image url"));
    return;
  }

  ctx.state.shared = Object.assign(
    { avatar: sanitizedProfileImage },
    ctx.state.shared
  );
};

export const validateUserModificationData = (ctx, errors) => {
  if (!Object.keys(ctx.request.body).length) return;

  validateUserProfileImage(ctx, errors);
  validateUserName(ctx, errors);
  validateUserBio(ctx, errors);
};
