import {
  newsletterEnabledSubscriptionsPipeline,
  spaceSubscribersPipeline,
  subscribedSpacesThreadsPipeline,
  userSubscriptionPipeline,
} from "../pipelines/subscription.js";
import { createNextPageToken } from "../utils/jwt.js";
import { client } from "./database.js";

const subscriptionCollection = client
  .db(process.env.DB_NAME)
  .collection("subscription");

export const createSubscription = async (subscription) =>
  await subscriptionCollection.insertOne(subscription);

export const countsOfSubscriptions = async (filter) =>
  await subscriptionCollection.countDocuments(filter);

export const readSubscription = async (filter, options) =>
  await subscriptionCollection.findOne(filter, options);

export const readUserSubscriptions = async (userId) =>
  await subscriptionCollection
    .aggregate(userSubscriptionPipeline(userId))
    .toArray();

export const readSpaceSubscribers = async (
  spaceId,
  pageSize = null,
  skipCount = 0
) => {
  const pipeline = spaceSubscribersPipeline(spaceId);

  const totalDocuments = await countsOfSubscriptions({ spaceId });
  if (totalDocuments && pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await subscriptionCollection.aggregate(pipeline).toArray();

  if (
    !pageSize ||
    !list.length ||
    list.length < pageSize ||
    pageSize + skipCount >= totalDocuments
  )
    return { list };

  return {
    nextPagetoken: createNextPageToken(spaceId, pageSize, skipCount),
    list,
  };
};

export const readSubscribedSpacesThreads = async (
  userId,
  pageSize = null,
  skipCount = 0
) => {
  const pipeline = subscribedSpacesThreadsPipeline(userId);

  if (pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await subscriptionCollection.aggregate(pipeline).toArray();

  if (!pageSize || !list.length || list.length < pageSize) return { list };

  return {
    nextPagetoken: createNextPageToken(null, pageSize, skipCount),
    list,
  };
};

export const readNewsletterEnabledSubscriptions = async (spaceId) =>
  await subscriptionCollection
    .aggregate(newsletterEnabledSubscriptionsPipeline(spaceId))
    .toArray();

export const updateSubscription = async (subscriptionId, data) =>
  await subscriptionCollection.updateOne(
    { subscriptionId },
    { $set: { ...data, updatedOn: new Date() } }
  );

export const deleteSubscription = async (subscriptionId) =>
  await subscriptionCollection.deleteOne({ subscriptionId });
