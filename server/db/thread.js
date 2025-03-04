import { client } from "./database.js";

const threadCollection = client.db(process.env.DB_NAME).collection("thread");

export const createThread = async (thread) =>
  await threadCollection.insertOne(thread);

export const readThread = async (filter, option) =>
  await threadCollection.findOne(filter, option);

export const readAllThreads = async (filter, option) =>
  await threadCollection.find(filter, option).toArray();

export const updateThread = async (threadId, data) =>
  await threadCollection.updateOne(
    { threadId },
    {
      $set: { ...data, updatedOn: new Date() },
    }
  );
