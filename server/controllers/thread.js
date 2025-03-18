import { v4 as uuidV4 } from "uuid";
import { threadStatus } from "../constants/enums.js";
import {
  createThread,
  readAllThreads,
  readFeaturedThreads,
  readThreadDetails,
  updateThread,
} from "../db/thread.js";
import {
  sendbackThreadForUpadte,
  sendThreadApprovedNotification,
  sendThreadPublishApproval,
} from "../emails/threads.js";
import { frontend } from "../constants/config.js";
import { readUser } from "../db/user.js";
import { readThreadIntractions, updateInteraction } from "../db/interaction.js";
import {
  createComment,
  deleteComments,
  readThreadComments,
  readThreadCommentReplies,
} from "../db/comment.js";
import { readSubscribedSpacesThreads } from "../db/subscription.js";
import { cacheData, getCachedData } from "../config/redis.js";

export const addNewThread = async (ctx) => {
  const { spaceId, ownerId } = ctx.state.space;
  const { userId: editorId } = ctx.request.user;
  const { name: ownerName, email: ownerEmail } = ctx.state.owner;
  const { title, content, tags } = ctx.state.shared;

  const thread = {
    threadId: uuidV4(),
    spaceId,
    ownerId,
    editorId,
    title,
    content,
    tags,
    isApproved: false,
    status: threadStatus.draft,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createThread(thread);
  await sendThreadPublishApproval(ownerEmail, {
    ownerName,
    postTitle: title,
    approvalLink: `${frontend}/threads/review`,
  });

  ctx.body = { message: "thread created and send for owner approval" };
};

export const getAllPendingReviewThread = async (ctx) => {
  const { userId } = ctx.request.user;

  const threads = await readAllThreads({
    $or: [{ ownerId: userId }, { editorId: userId }],
    isApproved: false,
  });

  if (!threads.length) {
    ctx.body = { message: "no pending threads for review" };
    return;
  }

  ctx.body = threads;
};

export const approveToPublishThread = async (ctx) => {
  const { threadId, editorId, title } = ctx.state.thread;
  await updateThread(threadId, {
    isApproved: true,
    status: threadStatus.published,
  });
  const editor = await readUser({ userId: editorId });
  await sendThreadApprovedNotification(editor.email, {
    editorName: editor.name,
    postTitle: title,
    postLink: `${frontend}/thread/${threadId}`,
  });
  ctx.body = { message: "thread approved successfully" };
};

export const sendbackThread = async (ctx) => {
  const { threadId, title: postTitle } = ctx.state.thread;
  const { email: editorEmail, name: editorName } = ctx.state.editor;

  await updateThread(threadId, { status: threadStatus.revision });
  await sendbackThreadForUpadte(editorEmail, {
    editorName,
    postTitle,
    threadLink: `${frontend}/thread/edit/${threadId}`,
  });

  ctx.body = { message: "thread sendback for approval" };
};

export const resendToPublishThread = async (ctx) => {
  const { title: postTitle } = ctx.state.thread;
  const { email: ownerEmail, name: ownerName } = ctx.state.owner;

  await sendThreadPublishApproval(ownerEmail, {
    ownerName,
    postTitle,
    approvalLink: `${frontend}/threads/review`,
  });
  ctx.body = { message: "resend for approval to publish" };
};

export const modifyThread = async (ctx) => {
  const { threadId } = ctx.state.thread;
  await updateThread(threadId, ctx.state.shared);
  ctx.body = { message: "thread updated successfully" };
};

export const toggleThreadInteraction = async (ctx) => {
  const { userId } = ctx.request.user;
  const { threadId } = ctx.state.thread;
  const { interaction } = ctx.state.shared;

  await updateInteraction(userId, threadId, interaction);
  ctx.body = { message: `thread ${interaction}` };
};

export const addThreadComment = async (ctx) => {
  const { userId } = ctx.request.user;
  const { threadId } = ctx.state.thread;

  const comment = {
    commentId: uuidV4(),
    threadId,
    userId,
    ...ctx.state.shared,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createComment(comment);
  ctx.body = { message: "comment added" };
};

export const removeThreadComment = async (ctx) => {
  const commentId = ctx.state.comment.commentId;

  await deleteComments(commentId);
  ctx.body = { message: "comment deleted" };
};

export const getThread = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const thread = await readThreadDetails(threadId);
  ctx.body = thread[0];
};

export const getFeaturedThreads = async (ctx) => {
  const tags = ctx.state.shared?.tags;
  const query = ctx.state.shared?.query;
  const { skipCount = 0 } = ctx.state.page || {};

  const cachedThreads = await getCachedData(`featured-threads-${skipCount}`);
  if (cachedThreads) {
    ctx.body = cachedThreads;
    return;
  }

  const threads = await readFeaturedThreads(tags, query?.listing, skipCount);

  await cacheData(`featured-threads-${skipCount}`, 1800, threads);

  if (!threads.list.length) {
    ctx.body = { message: "no thread to show" };
    return;
  }

  ctx.body = threads;
};

export const getSubscribedSpacesThreads = async (ctx) => {
  const { userId } = ctx.request.user;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const threads = await readSubscribedSpacesThreads(
    userId,
    pageSize,
    skipCount
  );
  if (!threads.list.length) {
    ctx.body = { message: "no subscribed spaces threads to show" };
    return;
  }

  ctx.body = threads;
};

export const getThreadInteractions = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const interactions = await readThreadIntractions(
    threadId,
    pageSize,
    skipCount
  );

  if (!interactions.list.length) {
    ctx.body = { message: "no comments found" };
  }

  ctx.body = interactions;
};

export const getThreadComments = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const comments = await readThreadComments(threadId, pageSize, skipCount);

  if (!comments.list.length) {
    ctx.body = { message: "no comments found" };
  }

  ctx.body = comments;
};

export const getThreadCommentReplies = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const { parentId } = ctx.state.shared;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const replies = await readThreadCommentReplies(
    threadId,
    parentId,
    pageSize,
    skipCount
  );

  if (!replies.list.length) {
    ctx.body = { message: "no replies" };
  }

  ctx.body = replies;
};
