import { validate as validateUuid } from "uuid";
import { buildPropertyError } from "../utils/validate.js";
import { readSpace } from "../db/space.js";

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

  const sanitizedTitle = title.trim();
  if (title.length < 1 || sanitizedTitle.split(/\s+/).length > 16) {
    errors.push(buildPropertyError("title", "title must be of 1 to 16 words"));
    return;
  }

  ctx.state.shared = Object.assign(
    { title: sanitizedTitle.split(/\s+/).join(" ") },
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

  const sanitizedDescription = description.trim().split(/\s+/);
  if (sanitizedDescription.length < 4 || sanitizedDescription.length > 64) {
    errors.push(
      buildPropertyError("description", "description must be of 4 to 64 words")
    );
    return;
  }

  ctx.state.shared = Object.assign(
    { description: sanitizedDescription.join(" ") },
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

export const validateSpaceModificationData = (ctx, errors) => {
  if (Object.keys(ctx.request.body).length === 0) {
    errors.push(buildPropertyError("data", "no data changed"));
    return;
  }

  validateSpaceTitle(ctx, errors);
  validateSpaceDescription(ctx, errors);
  validateSpacePrivacy(ctx, errors);
};
