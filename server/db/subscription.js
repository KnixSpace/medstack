import {
  spaceSubscribersPipeline,
  subscribedSpacesThreadsPipeline,
  userSubscriptionPipeline,
} from "../pipelines/subscription.js";
import { client } from "./database.js";

const subscriptionCollection = client
  .db(process.env.DB_NAME)
  .collection("subscription");

export const createSubscription = async (subscription) =>
  await subscriptionCollection.insertOne(subscription);

export const readSubscription = async (filter, options) =>
  await subscriptionCollection.findOne(filter, options);

export const readUserSubscriptions = async (userId) =>
  await subscriptionCollection
    .aggregate(userSubscriptionPipeline(userId))
    .toArray();

export const readSpaceSubscribers = async (spaceId) =>
  await subscriptionCollection
    .aggregate(spaceSubscribersPipeline(spaceId))
    .toArray();

export const readSubscribedSpacesThreads = async (userId) =>
  await subscriptionCollection
    .aggregate(subscribedSpacesThreadsPipeline(userId))
    .toArray();

export const updateSubscription = async (subscriptionId, data) =>
  await subscriptionCollection.updateOne(
    { subscriptionId },
    { $set: { ...data, updatedOn: new Date() } }
  );

export const deleteSubscription = async (subscriptionId) =>
  await subscriptionCollection.deleteOne({ subscriptionId });
