import { validate as validateUuid } from "uuid";
import { buildPropertyError } from "../utils/validate.js";
import { readThread } from "../db/thread.js";
import { readSpace } from "../db/space.js";
import { readUser } from "../db/user.js";
import {
  interactionTypes,
  threadStatus,
  userRole,
} from "../constants/enums.js";
import { readComment } from "../db/comment.js";
import { isValidImageUrl, isValidQueries } from "./common.js";

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
  const spaceId = ctx.request.body.spaceId || ctx.state.thread?.spaceId;

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

  if (ctx.request.url.includes("update")) {
    ctx.state.shared = Object.assign({ spaceId }, ctx.state.shared);
  }
};

export const validateThreadStatus = async (ctx, errors) => {
  if (ctx.state.thread === undefined) return;

  const { status } = ctx.state.thread;

  const url = ctx.request.url;
  if (url.includes("send-for-approval") && status !== threadStatus.draft) {
    errors.push(buildPropertyError("status", "thread is not draft"));
    return;
  }
};

export const validateThreadIsPublished = async (ctx, errors) => {
  if (ctx.state.thread === undefined) return;

  if (ctx.state.thread.status !== threadStatus.published) {
    errors.push(buildPropertyError("thread", "thread is not published"));
    return;
  }
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

export const validateThreadInteraction = (ctx, errors) => {
  const { interaction } = ctx.query;

  if (interaction === undefined) {
    errors.push(buildPropertyError("query", "invalid query"));
    return;
  }

  if (!interactionTypes.includes(interaction)) {
    errors.push(buildPropertyError("query", "invalid query"));
    return;
  }
  ctx.state.shared = Object.assign({ interaction }, ctx.state.shared);
};

export const validateThreadCommentId = async (ctx, errors) => {
  const { commentId } = ctx.params;

  if (!commentId || !validateUuid(commentId)) {
    errors.push(buildPropertyError("params", "Invalid commentId or params"));
    return;
  }

  const comment = await readComment({ commentId });
  if (!comment) {
    errors.push(buildPropertyError("commentId", "invlaid commentId"));
    return;
  }
  ctx.state.comment = comment;
};

export const validateThreadParentCommentId = async (ctx, errors) => {
  if (!ctx.state.thread) return;

  const { parentId } = ctx.query;
  const { threadId } = ctx.state.thread;

  if (!parentId || !validateUuid(parentId)) {
    errors.push(buildPropertyError("params", "Invalid commentId or params"));
    return;
  }

  const comment = await readComment({ commentId: parentId });
  if (!comment) {
    errors.push(buildPropertyError("commentId", "invlaid parent commentId"));
    return;
  }

  if (comment.parentId) {
    errors.push(
      buildPropertyError("commentId", "child comment cannot be parent")
    );
    return;
  }

  if (comment.threadId !== threadId) {
    errors.push(
      buildPropertyError(
        "commentId",
        "parent comment does not belong to the thread"
      )
    );
    return;
  }

  ctx.state.shared = Object.assign({ parentId }, ctx.state.shared);
};

export const validateThreadCommentOwnership = async (ctx, errors) => {
  if (ctx.state.comment === undefined) return;

  const { userId, role } = ctx.request.user;
  const { userId: commentUserId } = ctx.state.comment;

  if (
    [userRole.editor, userRole.user].includes(role) &&
    userId !== commentUserId
  ) {
    errors.push(buildPropertyError("unauthorized", "invlaid access"));
    return;
  }
};

export const validateThreadCommentContent = (ctx, errors) => {
  const content = ctx.request.body.comment || ctx.request.body.reply;

  if (content === undefined) {
    errors.push(buildPropertyError("content", "comment content required"));
    return;
  } else if (typeof content !== "string") {
    errors.push(
      buildPropertyError("content", "comment content must be string")
    );
    return;
  }

  const sanitizedComment = content.trim();
  if (sanitizedComment.length < 1 || sanitizedComment.split(/s+/).length > 16) {
    errors.push(
      buildPropertyError("content", "comment content be 1 to 16 words")
    );
    return;
  }

  if (ctx.request.body.reply) {
    ctx.state.shared = Object.assign(
      { reply: sanitizedComment },
      ctx.state.shared
    );
    return;
  }

  ctx.state.shared = Object.assign(
    { comment: sanitizedComment },
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

  const parsedContent = JSON.parse(content);
  if (parsedContent.blocks.length < 5 || parsedContent.blocks.length > 1024) {
    errors.push(
      buildPropertyError("content", "content must be of 5 to 1024 blocks")
    );
    return;
  }

  ctx.state.shared = Object.assign({ content }, ctx.state.shared);
};

export const validateThreadTags = (ctx, errors) => {
  const { tags } = ctx.request.body;

  if (tags === undefined || !tags.length) {
    errors.push(buildPropertyError("tags", "tags is required"));
  } else if (tags.length > 5) {
    errors.push(buildPropertyError("tags", "maximum tags allowed  is only 5"));
  } else if (!tags.every((tag) => typeof tag.name === "string")) {
    errors.push(buildPropertyError("tags", "tags must be string"));
  } else if (
    !tags.every(
      (tag) => tag.name.trim().length > 0 && tag.name.trim().length <= 16
    )
  ) {
    errors.push(
      buildPropertyError("tags", "tags must be between 1 to 16 characters")
    );
  } else {
    ctx.state.shared = Object.assign(
      {
        tags: tags.map((tag) => {
          return {
            id: tag.id,
            name: tag.name.split(/\s+/).join(" ").toLowerCase(),
          };
        }),
      },
      ctx.state.shared
    );
  }
};

export const validateThreadCoverImage = (ctx, errors) => {
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
  validateThreadTags(ctx, errors);
  validateThreadCoverImage(ctx, errors);
  validateThreadSpace(ctx, errors);
};

export const validateThreadQueryParameters = (ctx, errors) => {
  if (!ctx.querystring) return;

  const query = isValidQueries(ctx.querystring, [
    "parentId",
    "sort",
    "listing",
    "pageSize",
    "pageToken",
  ]);

  if (!query) {
    errors.push(buildPropertyError("query", "invalid query"));
    return;
  }
  ctx.state.query = Object.assign(query, ctx.state.query);
};

export const validateThreadQueryTags = (ctx, errors) => {
  const { tags } = ctx.request.body;
  if (!tags) return;

  if (!Array.isArray(tags)) {
    errors.push(buildPropertyError("tags", "tags must be array"));
    return;
  }

  ctx.state.shared = Object.assign(
    { tags: tags.map((tag) => tag.toLowerCase()) },
    ctx.state.shared
  );
};
