import {
  threadCommentRepliesPipeline,
  threadCommentsWithRepliesCountPipeline,
} from "../pipelines/comment.js";
import { createNextPageToken } from "../utils/jwt.js";
import { client } from "./database.js";

const commentCollection = client.db(process.env.DB_NAME).collection("comment");

export const createComment = async (comment) =>
  await commentCollection.insertOne(comment);

export const countsOfComments = async (filter) =>
  await commentCollection.countDocuments(filter);

export const readComment = async (filter, options) =>
  await commentCollection.findOne(filter, options);

export const readThreadComments = async (
  threadId,
  pageSize = null,
  skipCount = 0
) => {
  const pipeline = threadCommentsWithRepliesCountPipeline(threadId);

  const totalDocuments = await countsOfComments({ threadId, parentId: null });
  if (totalDocuments && pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await commentCollection.aggregate(pipeline).toArray();
  if (
    !pageSize ||
    !list.length ||
    list.length < pageSize ||
    pageSize + skipCount >= totalDocuments
  )
    return { list };

  return {
    nextPagetoken: createNextPageToken(threadId, pageSize, skipCount),
    list,
  };
};

export const readThreadCommentReplies = async (
  threadId,
  parentId,
  pageSize,
  skipCount
) => {
  const pipeline = threadCommentRepliesPipeline(threadId, parentId);

  const totalDocuments = await countsOfComments({ threadId, parentId });
  if (totalDocuments && pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await commentCollection.aggregate(pipeline).toArray();
  if (
    !pageSize ||
    !list.length ||
    list.length < pageSize ||
    pageSize + skipCount >= totalDocuments
  )
    return { list };

  return {
    nextPagetoken: createNextPageToken(threadId, pageSize, skipCount),
    list,
  };
};

export const deleteComments = async (commentId) =>
  await commentCollection.deleteMany({
    $or: [{ commentId }, { parentId: commentId }],
  });
