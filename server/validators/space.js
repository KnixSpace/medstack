import { validate as validateUuid } from "uuid";
import { buildPropertyError } from "../utils/validate.js";
import { readSpace } from "../db/space.js";
import { readSubscription } from "../db/subscription.js";
import { isValidImageUrl } from "./common.js";

export const validateSpaceId = async (ctx, errors) => {
  const spaceId = ctx.params.spaceId || ctx.request.body.spaceId;

  if (!validateUuid(spaceId)) {
    errors.push(buildPropertyError("space", "invalid space id"));
    return;
  }

  const space = await readSpace({ spaceId });
  if (!space) {
    errors.push(buildPropertyError("space", "no space found"));
    return;
  }

  ctx.state.space = space;
};

export const validateSpaceOwner = async (ctx, errors) => {
  if (ctx.state.space === undefined) return;

  const { ownerId } = ctx.state.space;
  const { userId } = ctx.request.user;

  if (ownerId !== userId) {
    errors.push(buildPropertyError("invalid", "invalid access"));
    return;
  }
};

export const validateSpaceSubscription = async (ctx, errors) => {
  if (ctx.state.space?.spaceId === undefined) return;

  const spaceId = ctx.state.space.spaceId;
  const userId = ctx.request.user.userId;
  const subscription = await readSubscription({ spaceId, userId });

  if (ctx.url.includes("/subscribe") && subscription) {
    errors.push(
      buildPropertyError("invalid", "already subscribed to this space")
    );
    return;
  }

  if (ctx.url.includes("/unsubscribe") && !subscription) {
    errors.push(buildPropertyError("invalid", "no subscription found"));
    return;
  }

  if (ctx.url.includes("/newsletter") && !subscription) {
    errors.push(buildPropertyError("invalid", "no subscription found"));
    return;
  }

  ctx.state.subscription = subscription;
};

export const validateSpaceTitle = (ctx, errors) => {
  const { title } = ctx.request.body;

  if (title === undefined) {
    if (ctx.url.includes("update")) return;
    errors.push(buildPropertyError("title", "title is required"));
    return;
  } else if (typeof title !== "string") {
    errors.push(buildPropertyError("title", "title must be string"));
    return;
  }

  const sanitizedTitle = title.trim().split(/\s+/);
  if (sanitizedTitle.length < 2 || sanitizedTitle.length > 16) {
    errors.push(buildPropertyError("title", "title must be of 2 to 16 words"));
    return;
  }

  ctx.state.shared = Object.assign(
    { title: sanitizedTitle.join(" ") },
    ctx.state.shared
  );
};

export const validateSpaceDescription = (ctx, errors) => {
  const { description } = ctx.request.body;

  if (description === undefined) {
    if (ctx.url.includes("update")) return;
    errors.push(buildPropertyError("description", "description is required"));
  } else if (typeof description !== "string") {
    errors.push(
      buildPropertyError("description", "description must be string")
    );
  }

  const sanitizedDescription = description.trim();
  if (
    sanitizedDescription.split(/\s+/).length < 4 ||
    sanitizedDescription.split(/\s+/).length > 64
  ) {
    errors.push(
      buildPropertyError("description", "description must be of 4 to 64 words")
    );
    return;
  }

  ctx.state.shared = Object.assign(
    { description: sanitizedDescription },
    ctx.state.shared
  );
};

export const validateSpacePrivacy = (ctx, errors) => {
  const { isPrivate } = ctx.request.body;

  if (isPrivate === undefined) return;

  if (typeof isPrivate !== "boolean") {
    errors.push(buildPropertyError("isPrivate", "must be boolean"));
    return;
  } else {
    ctx.state.shared = Object.assign({ isPrivate }, ctx.state.shared);
  }
};

export const validateSpaceCoverImage = (ctx, errors) => {
  const { coverImage } = ctx.request.body;

  if (!coverImage) return;

  if (typeof coverImage !== "string") {
    errors.push(buildPropertyError("coverImage", "must be string"));
    return;
  }

  const sanitizedCoverImage = coverImage.trim();
  if (!isValidImageUrl(sanitizedCoverImage)) {
    errors.push(buildPropertyError("coverImage", "invalid image url"));
    return;
  }

  ctx.state.shared = Object.assign(
    { coverImage: sanitizedCoverImage },
    ctx.state.shared
  );
};

export const validateSpaceModificationData = (ctx, errors) => {
  if (Object.keys(ctx.request.body).length === 0) {
    errors.push(buildPropertyError("data", "no data changed"));
    return;
  }

  validateSpaceCoverImage(ctx, errors);
  validateSpaceTitle(ctx, errors);
  validateSpaceDescription(ctx, errors);
  validateSpacePrivacy(ctx, errors);
};
