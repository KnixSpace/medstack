import {
  featuredThreadsPipeline,
  threadDetailsPipeline,
} from "../pipelines/thread.js";
import { createNextPageToken } from "../utils/jwt.js";
import { client } from "./database.js";

const threadCollection = client.db(process.env.DB_NAME).collection("thread");

export const createThread = async (thread) =>
  await threadCollection.insertOne(thread);

export const countsOfThreads = async (filter) =>
  await threadCollection.countDocuments(filter);

export const readThread = async (filter, option) =>
  await threadCollection.findOne(filter, option);

export const readThreadDetails = async (threadId) =>
  await threadCollection.aggregate(threadDetailsPipeline(threadId)).toArray();

export const readThreadsOfSpace = async (
  spaceId,
  filters = {},
  pageSize = null,
  skipCount = 0
) => {
  const pipeline = [];
  const matchStage = {
    spaceId,
    isApproved: true,
    status: "P",
  };

  if (filters.tags?.length) {
    matchStage.tags = { $in: filters.tags };
  }

  pipeline.push({ $match: matchStage });
  pipeline.push({ $sort: { createdOn: filters.sort === "DSEC" ? 1 : -1 } });

  const totalDocuments = await countsOfThreads(matchStage);
  if (totalDocuments && pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await threadCollection.aggregate(pipeline).toArray();

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

export const readFeaturedThreads = async (
  tags,
  threadsListingType,
  skipCount = 0
) => {
  const pipeline = featuredThreadsPipeline(tags, threadsListingType);
  const pageSize = 2;

  const totalDocuments = await countsOfThreads({
    isApproved: true,
    status: "P",
  });
  if (totalDocuments && pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await threadCollection.aggregate(pipeline).toArray();
  if (
    !pageSize ||
    !list.length ||
    list.length < pageSize ||
    pageSize + skipCount >= totalDocuments
  )
    return { list };

  return {
    nextPagetoken: createNextPageToken(null, pageSize, skipCount),
    list,
  };
};

export const readAllThreads = async (filter, option) =>
  await threadCollection.find(filter, option).toArray();

export const updateThread = async (threadId, data) =>
  await threadCollection.updateOne(
    { threadId },
    {
      $set: { ...data, updatedOn: new Date() },
    }
  );
