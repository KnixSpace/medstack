import { threadDetailsPipeline } from "../pipelines/thread.js";
import { client } from "./database.js";

const threadCollection = client.db(process.env.DB_NAME).collection("thread");

export const createThread = async (thread) =>
  await threadCollection.insertOne(thread);

export const readThread = async (filter, option) =>
  await threadCollection.findOne(filter, option);

export const readThreadDetails = async (threadId) =>
  await threadCollection.aggregate(threadDetailsPipeline(threadId)).toArray();

export const readAllThreads = async (filter, option) =>
  await threadCollection.find(filter, option).toArray();

export const updateThread = async (threadId, data) =>
  await threadCollection.updateOne(
    { threadId },
    {
      $set: { ...data, updatedOn: new Date() },
    }
  );
