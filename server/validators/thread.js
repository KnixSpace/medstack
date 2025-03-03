import { validate as validateUuid } from "uuid";
import { buildPropertyError } from "../utils/validate.js";
import { readThread } from "../db/thread.js";
import { readSpace } from "../db/space.js";
import { readUser } from "../db/user.js";
import { userRole } from "../constants/auth.js";

export const validateThreadId = async (ctx, errors) => {
  const threadId = ctx.params.threadId;
  if (!validateUuid(threadId)) {
    errors.push(buildPropertyError("thread", "invalid thread id"));
    return;
  }

  const thread = await readThread({ threadId });
  if (!thread) {
    errors.push(buildPropertyError("thread", "invalid thread id"));
    return;
  }

  ctx.state.thread = thread;
};

export const validateThreadSpace = async (ctx, errors) => {
  const spaceId = ctx.request.body?.spaceId || ctx.state.thread?.spaceId;

  if (spaceId === undefined) {
    if (ctx.url.includes("/create")) {
      errors.push(buildPropertyError("spaceId", "spaceId is required"));
      return;
    }
    return;
  }

  const space = await readSpace({ spaceId });
  if (!space) {
    errors.push(buildPropertyError("spaceId", "invalid space"));
    return;
  }

  ctx.state.space = space;
};

export const validateThreadOwnership = async (ctx, errors) => {
  if (ctx.state.space === undefined) return;

  const spaceOwner = await readUser({ userId: ctx.state.space.ownerId });
  if (!spaceOwner) {
    errors.push(buildPropertyError("owner", "invalid owner"));
    return;
  }

  const loginRole = ctx.request.user.role;
  if (
    loginRole === userRole.editor &&
    spaceOwner.userId !== ctx.state.owner.userId
  ) {
    errors.push(buildPropertyError("invalid", "invalid access"));
    return;
  } else if (
    loginRole === userRole.owner &&
    spaceOwner.userId !== ctx.request.user.userId
  ) {
    errors.push(buildPropertyError("invalid", "invalid access"));
    return;
  }
};

export const validateThreadEditor = async (ctx, errors) => {
  if (ctx.state.thread === undefined) return;

  const editor = await readUser({ userId: ctx.state.thread.editorId });
  if (!editor) {
    errors.push(buildPropertyError("editor", "editor not found"));
    return;
  }

  ctx.state.editor = editor;
};

export const validateThreadTitle = (ctx, errors) => {
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
  if (sanitizedTitle.length < 4 || sanitizedTitle.length > 16) {
    errors.push(buildPropertyError("title", "title must be of 4 to 16 words"));
    return;
  }

  ctx.state.shared = Object.assign(
    { title: sanitizedTitle.join(" ") },
    ctx.state.shared
  );
};

export const validateThreadContent = (ctx, errors) => {
  const { content } = ctx.request.body;

  if (content === undefined) {
    if (ctx.url.includes("update")) return;
    errors.push(buildPropertyError("content", "content is required"));
    return;
  } else if (typeof content !== "string") {
    errors.push(buildPropertyError("content", "content must be string"));
    return;
  }

  const splitContent = content.trim();
  if (
    splitContent.split(/\s+/).length < 10 ||
    splitContent.split(/\s+/).length > 500
  ) {
    errors.push(
      buildPropertyError("content", "content must be of 10 to 500 words")
    );
    return;
  }

  ctx.state.shared = Object.assign({ content: splitContent }, ctx.state.shared);
};

export const validateThreadTags = (ctx, errors) => {
  const { tags } = ctx.request.body;

  if (tags === undefined || !tags.length) {
    errors.push(buildPropertyError("tags", "tags is required"));
  } else if (tags.length > 5) {
    errors.push(buildPropertyError("tags", "maximum tags allowed  is only 5"));
  } else if (!tags.every((tag) => typeof tag === "string")) {
    errors.push(buildPropertyError("tags", "tags must be string"));
  } else if (
    !tags.every((tag) => tag.trim().length > 0 && tag.trim().length <= 16)
  ) {
    errors.push(
      buildPropertyError("tags", "tags must be between 1 to 16 characters")
    );
  } else {
    ctx.state.shared = Object.assign(
      {
        tags: Array.from(
          new Set(tags.map((tag) => tag.split(/\s+/).join(" ").toLowerCase()))
        ),
      },
      ctx.state.shared
    );
  }
};

export const validateThreadIsApprovedToPublished = (ctx, errors) => {
  if (ctx.state.thread === undefined) return;

  const { isApproved } = ctx.state.thread;
  if (isApproved) {
    errors.push(buildPropertyError("isApproved", "thread is already approved"));
  }
};

export const validateThreadModificationData = (ctx, errors) => {
  if (ctx.state.thread === undefined) return;
  if (Object.keys(ctx.request.body).length === 0) {
    errors.push(buildPropertyError("data", "no data changed"));
    return;
  }

  validateThreadTitle(ctx, errors);
  validateThreadContent(ctx, errors);
};
