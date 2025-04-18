import { v4 as uuidV4 } from "uuid";
import Bluebird from "bluebird";
import { threadStatus } from "../constants/enums.js";
import {
  createThread,
  readAllThreads,
  readFeaturedThreads,
  readMyThreads,
  readPendingApprovalThreads,
  readThreadDataForPreview,
  readThreadDetails,
  readThreadTags,
  updateThread,
} from "../db/thread.js";
import {
  sendbackThreadForUpdate,
  sendNewsletter,
  sendThreadApprovedNotification,
  sendThreadPublishApproval,
} from "../emails/threads.js";
import { frontend } from "../constants/config.js";
import { readUser } from "../db/user.js";
import {
  readThreadInteractions,
  updateInteraction,
} from "../db/interaction.js";
import {
  createComment,
  deleteComments,
  readThreadComments,
  readThreadCommentReplies,
} from "../db/comment.js";
import {
  readNewsletterEnabledSubscriptions,
  readSubscribedSpacesThreads,
} from "../db/subscription.js";
import { cacheData, getCachedData } from "../config/redis.js";

export const addNewThread = async (ctx) => {
  const { spaceId, ownerId } = ctx.state.space;
  const { userId: editorId } = ctx.request.user;
  const { title, content, tags, coverImage } = ctx.state.shared;

  const thread = {
    threadId: uuidV4(),
    spaceId,
    ownerId,
    editorId,
    title,
    content,
    coverImage,
    tags,
    status: threadStatus.draft,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createThread(thread);
  ctx.body = {
    message: "thread created successfully...",
    data: { threadId: thread.threadId },
  };
};

export const modifyThread = async (ctx) => {
  const { threadId } = ctx.state.thread;

  await updateThread(threadId, {
    status: threadStatus.draft,
    ...ctx.state.shared,
  });

  ctx.body = { message: "thread updated successfully" };
};

export const sendThreadForApproval = async (ctx) => {
  const { title, threadId } = ctx.state.thread;
  const { email: ownerEmail, name: ownerName } = ctx.state.owner;

  await updateThread(threadId, {
    status: threadStatus.awaitingApproval,
  });

  await sendThreadPublishApproval(ownerEmail, {
    ownerName,
    threadTitle: title,
    approvalLink: `${frontend}/settings/thread-approvals`,
  });

  ctx.body = { message: "thread sent for approval" };
};

export const requestThreadCorrection = async (ctx) => {
  const { rejectionReason = "" } = ctx.request.body || {};
  const { threadId, title: postTitle } = ctx.state.thread;
  const { email: editorEmail, name: editorName } = ctx.state.editor;

  await updateThread(threadId, {
    status: threadStatus.revision,
    rejectionReason,
  });
  await sendbackThreadForUpdate(editorEmail, {
    editorName,
    postTitle,
    threadLink: `${frontend}/thread/edit/${threadId}`,
  });

  ctx.body = { message: "thread send back for correction" };
};

export const publishThread = async (ctx) => {
  const { threadId, spaceId, editorId, title } = ctx.state.thread;

  await updateThread(threadId, {
    publishedOn: new Date(),
    status: threadStatus.published,
  });

  const editor = await readUser({ userId: editorId });
  await sendThreadApprovedNotification(editor.email, {
    editorName: editor.name,
    postTitle: title,
    postLink: `${frontend}/thread/view/${threadId}`,
  });

  const newsletterSubscribers = await readNewsletterEnabledSubscriptions(
    spaceId
  );

  if (newsletterSubscribers[0]?.users.length) {
    const subscribers = newsletterSubscribers[0].users;
    await Bluebird.map(
      subscribers,
      async (subscriber) => {
        await sendNewsletter(subscriber.email, {
          title,
          userName: subscriber.name,
          link: `${frontend}/thread/view/${threadId}`,
        });
      },
      { concurrency: 5 }
    );
  }
  ctx.body = { message: "Thread publish successfully" };
};

export const toggleThreadInteraction = async (ctx) => {
  const { userId } = ctx.request.user;
  const { threadId } = ctx.state.thread;
  const { interaction } = ctx.state.shared;

  await updateInteraction(userId, threadId, interaction);
  ctx.body = { message: `thread ${interaction}` };
};

export const commentOnThread = async (ctx) => {
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

export const getThreadTags = async (ctx) => {
  const tags = (await readThreadTags()).flatMap((tag) => tag.tags);

  if (!tags.length) {
    ctx.body = { message: "no tags found", data: [] };
    return;
  }

  ctx.body = { message: "tags fetched successfully", data: [...new Set(tags)] };
};

export const getOwnersThreads = async (ctx) => {
  const { ownerId } = ctx.params;

  const threads = await readAllThreads({
    ownerId,
    status: threadStatus.published,
  });

  ctx.status = 200;
  ctx.body = { message: "threads fetched successfully", data: threads };
};

export const getMyThreads = async (ctx) => {
  const { userId } = ctx.request.user;

  const threads = await readMyThreads(userId);

  ctx.status = 200;
  ctx.body = { message: "threads fetched successfully", data: threads };
};

export const getPendingApprovalThreads = async (ctx) => {
  const { userId } = ctx.request.user;

  const threads = await readPendingApprovalThreads(userId);

  if (!threads.length) {
    ctx.body = { message: "no pending threads for review" };
    return;
  }

  ctx.body = { message: "threads fetched successfully", data: threads };
};

export const getThreadDataForEdit = async (ctx) => {
  const thread = ctx.state.thread;

  if (!thread) {
    ctx.body = { message: "no thread found" };
    return;
  }
  ctx.body = { message: "thread fetched successfully", data: thread };
};

export const getThreadDataForPreview = async (ctx) => {
  const { threadId } = ctx.state.thread;

  const thread = await readThreadDataForPreview(threadId);

  if (!thread.length) {
    ctx.body = { message: "no thread found" };
  }

  ctx.status = 200;
  ctx.body = {
    message: "thread fetched successfully",
    data: thread[0],
  };
};

export const getThread = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const thread = await readThreadDetails(threadId);
  ctx.body = {
    message: "thread fetched successfully",
    data: thread[0],
  };
};

export const getThreadInteractions = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const interactions = await readThreadInteractions(
    threadId,
    pageSize,
    skipCount
  );

  if (!interactions.list.length) {
    ctx.body = { message: "no comments found" };
  }

  ctx.body = {
    message: "interactions fetched successfully",
    data: interactions,
  };
};

export const getThreadComments = async (ctx) => {
  const { threadId } = ctx.state.thread;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const comments = await readThreadComments(threadId, pageSize, skipCount);

  if (!comments.list.length) {
    ctx.body = { message: "no comments found" };
  }

  ctx.body = {
    message: "comments fetched successfully",
    data: comments,
  };
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

  ctx.body = {
    message: "replies fetched successfully",
    data: replies,
  };
};

export const getFeaturedThreads = async (ctx) => {
  const tags = ctx.state.shared?.tags;
  const query = ctx.state.shared?.query;
  const { skipCount = 0 } = ctx.state.page || {};

  const cachedThreads = await getCachedData(`featured-threads-${skipCount}`);
  if (cachedThreads) {
    ctx.body = {
      message: "threads fetched successfully",
      data: cachedThreads,
    };
    return;
  }

  const threads = await readFeaturedThreads(tags, query?.listing, skipCount);

  await cacheData(`featured-threads-${skipCount}`, 3600, threads);

  if (!threads.list.length) {
    ctx.body = { message: "no thread to show", data: [] };
    return;
  }

  ctx.body = {
    message: "threads fetched successfully",
    data: threads,
  };
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
