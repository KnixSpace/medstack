import { threadStatus } from "../constants/enums.js";
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
    status: threadStatus.published,
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
    status: threadStatus.published,
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

export const readThreadDataForPreview = async (threadId) =>
  await threadCollection
    .aggregate([
      { $match: { threadId } },
      {
        $lookup: {
          from: "space",
          localField: "spaceId",
          foreignField: "spaceId",
          pipeline: [
            {
              $project: {
                _id: 0,
                title: 1,
              },
            },
          ],
          as: "spaceDetails",
        },
      },
      {
        $addFields: {
          spaceDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$spaceDetails", 0],
              },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "ownerId",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
                avatar: 1,
              },
            },
          ],
          as: "ownerDetails",
        },
      },
      {
        $addFields: {
          ownerDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$ownerDetails", 0],
              },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "editorId",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
                avatar: 1,
              },
            },
          ],
          as: "editorDetails",
        },
      },
      {
        $addFields: {
          editorDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$editorDetails", 0],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();

export const readMyThreads = async (userId) =>
  await threadCollection
    .aggregate([
      {
        $match: {
          $or: [{ ownerId: userId }, { editorId: userId }],
        },
      },
      {
        $lookup: {
          from: "space",
          localField: "spaceId",
          foreignField: "spaceId",
          pipeline: [
            {
              $project: {
                _id: 0,
                title: 1,
              },
            },
          ],
          as: "spaceDetails",
        },
      },
      {
        $addFields: {
          spaceDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$spaceDetails", 0],
              },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "editorId",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
                avatar: 1,
              },
            },
          ],
          as: "editorDetails",
        },
      },
      {
        $addFields: {
          editorDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$editorDetails", 0],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          content: 0,
          _id: 0,
        },
      },
    ])
    .toArray();

export const readPendingApprovalThreads = async (userId) =>
  await threadCollection
    .aggregate([
      {
        $match: {
          $or: [{ ownerId: userId }, { editorId: userId }],
          status: threadStatus.awaitingApproval,
        },
      },
      {
        $lookup: {
          from: "space",
          localField: "spaceId",
          foreignField: "spaceId",
          pipeline: [
            {
              $project: {
                _id: 0,
                title: 1,
              },
            },
          ],
          as: "spaceDetails",
        },
      },
      {
        $addFields: {
          spaceDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$spaceDetails", 0],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          content: 0,
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "editorId",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
                avatar: 1,
              },
            },
          ],
          as: "editorDetails",
        },
      },
      {
        $addFields: {
          editorDetails: {
            $ifNull: [
              {
                $arrayElemAt: ["$editorDetails", 0],
              },
              null,
            ],
          },
        },
      },
    ])
    .toArray();

export const readAllThreads = async (filter, option) =>
  await threadCollection.find(filter, option).toArray();

export const updateThread = async (threadId, data) =>
  await threadCollection.updateOne(
    { threadId },
    {
      $set: { ...data, updatedOn: new Date() },
    }
  );
