import { validate as validateUuid } from "uuid";
import { buildPropertyError } from "../utils/validate.js";
import { isSpace } from "../db/space.js";

export const validateSpaceOwner = async (ctx, errors) => {
  const { spaceId } = ctx.params;
  const { userId } = ctx.request.user;

  if (!validateUuid(spaceId)) {
    errors.push(buildPropertyError("spaceId", "invalid space id"));
  } else if (!(await isSpace({ spaceId, ownerId: userId }))) {
    errors.push(buildPropertyError("spaceId", "invalid space owner"));
  }
};

export const validateSpaceTitle = (ctx, errors) => {
  const { title } = ctx.request.body;

  if (title === undefined) {
    errors.push(buildPropertyError("title", "title is required"));
  } else if (typeof title !== "string") {
    errors.push(buildPropertyError("title", "title must be string"));
  } else if (title.trim().length < 1 || title.trim().split(" ").length > 16) {
    errors.push(buildPropertyError("title", "title must be of 1 to 16 words"));
  } else {
    ctx.state.space = Object.assign({ title: title.trim() }, ctx.state.space);
  }
};

export const validateSpaceDescription = (ctx, errors) => {
  const { description } = ctx.request.body;

  if (description === undefined) {
    errors.push(buildPropertyError("description", "description is required"));
  } else if (typeof description !== "string") {
    errors.push(
      buildPropertyError("description", "description must be string")
    );
  } else if (
    description.trim().split(" ").length < 5 ||
    description.trim().split(" ").length > 64
  ) {
    errors.push(
      buildPropertyError("description", "description must be of 5 to 64 words")
    );
  } else {
    ctx.state.space = Object.assign(
      { description: description.trim() },
      ctx.state.space
    );
  }
};

export const validateSpacePrivacy = (ctx, errors) => {
  const { isPrivate } = ctx.request.body;

  if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
    errors.push(buildPropertyError("isPrivate", "must be boolean"));
    return;
  }

  if (isPrivate !== undefined) {
    ctx.state.space = Object.assign({ isPrivate }, ctx.state.space);
  }
};

export const validateSpaceModificationData = (ctx, errors) => {
  const { title, description, isPrivate } = ctx.request.body;

  if (Object.keys(ctx.request.body).length === 0) {
    errors.push(buildPropertyError("data", "no data changed"));
    return;
  }

  if (title !== undefined) {
    if (typeof title !== "string") {
      errors.push(buildPropertyError("title", "title must be string"));
    } else if (title.trim().length < 1 || title.trim().split(" ").length > 16) {
      errors.push(
        buildPropertyError("title", "title must be of 1 to 16 words")
      );
    } else {
      ctx.state.space = Object.assign({ title: title.trim() }, ctx.state.space);
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      errors.push(
        buildPropertyError("description", "description must be string")
      );
    } else if (
      description.trim().split(" ").length < 5 ||
      description.trim().split(" ").length > 64
    ) {
      errors.push(
        buildPropertyError(
          "description",
          "description must be of 5 to 64 words"
        )
      );
    } else {
      ctx.state.space = Object.assign(
        { description: description.trim() },
        ctx.state.space
      );
    }
  }

  if (isPrivate !== undefined) {
    if (typeof isPrivate !== "boolean") {
      errors.push(buildPropertyError("isPrivate", "must be boolean"));
    } else {
      ctx.state.space = Object.assign({ isPrivate }, ctx.state.space);
    }
  }
};
