import {
  threadCommentRepliesPipeline,
  threadCommentsWithRepliesCountPipeline,
} from "../pipelines/comment.js";
import { client } from "./database.js";

const commentCollection = client.db(process.env.DB_NAME).collection("comment");

export const createComment = async (comment) =>
  await commentCollection.insertOne(comment);

export const readComment = async (filter, options) =>
  await commentCollection.findOne(filter, options);

export const readThreadComments = async (threadId) =>
  await commentCollection
    .aggregate(threadCommentsWithRepliesCountPipeline(threadId))
    .toArray();

export const readThreadCommentReplies = async (threadId, parentId) =>
  await commentCollection
    .aggregate(threadCommentRepliesPipeline(threadId, parentId))
    .toArray();

export const deleteComments = async (commentId) =>
  await commentCollection.deleteMany({
    $or: [{ commentId }, { parentId: commentId }],
  });
