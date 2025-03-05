import { spacesWithSubscriptionCountPipeline } from "../pipelines/space.js";
import { client } from "./database.js";

const spaceCollection = client.db(process.env.DB_NAME).collection("space");

export const createSpace = async (space) =>
  await spaceCollection.insertOne(space);

export const readSpace = async (filter, options) =>
  await spaceCollection.findOne(filter, options);

export const readAllSpaces = async (filter, options) =>
  await spaceCollection.find(filter, options).toArray();

export const readSpacesWithSubscriberCounts = async (ownerId) =>
  await spaceCollection
    .aggregate(spacesWithSubscriptionCountPipeline(ownerId))
    .toArray();

export const updateSpace = async (spaceId, data) =>
  await spaceCollection.updateOne(
    { spaceId },
    { $set: { ...data, updatedOn: new Date() } }
  );
