import { client } from "./database.js";

const spaceCollection = client.db(process.env.DB_NAME).collection("space");

export const isSpace = async (filter) =>
  await spaceCollection.countDocuments(filter);

export const createSpace = async (space) =>
  await spaceCollection.insertOne(space);

export const readAllSpaces = async (filter, options) =>
  await spaceCollection.find(filter, options).toArray();

export const updateSpace = async (spaceId, data) =>
  await spaceCollection.updateOne(
    { spaceId },
    { $set: { ...data, updatedOn: new Date() } }
  );
