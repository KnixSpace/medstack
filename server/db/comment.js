import { client } from "./database.js";

const commentCollection = client.db(process.env.DB_NAME).collection("comment");

export const createComment = async (comment) =>
  await commentCollection.insertOne(comment);

export const readComment = async (filter, options) =>
  await commentCollection.findOne(filter, options);

export const deleteComments = async (commentId) =>
  await commentCollection.deleteMany({
    $or: [{ commentId }, { parentId: commentId }],
  });
