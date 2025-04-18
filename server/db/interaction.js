import { createNextPageToken } from "../utils/jwt.js";
import { client } from "./database.js";

const interactionCollection = client
  .db(process.env.DB_NAME)
  .collection("interaction");

export const readThreadInteractions = async (threadId, pageSize, skipCount) => {
  const pipeline = [
    {
      $match: {
        threadId,
        interaction: { $in: ["like"] },
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "userId",
        foreignField: "userId",
        as: "user",
      },
    },
    {
      $set: {
        userName: { $arrayElemAt: ["$user.name", 0] },
        userAvatar: { $arrayElemAt: ["$user.avatar", 0] },
      },
    },
    {
      $project: {
        interaction: 1,
        userId: 1,
        userName: 1,
        userAvatar: 1,
      },
    },
  ];

  const totalDocuments = await interactionCollection.countDocuments({
    threadId,
  });
  if (totalDocuments && pageSize) {
    pipeline.push({ $skip: skipCount });
    pipeline.push({ $limit: pageSize });
  }

  const list = await interactionCollection.aggregate(pipeline).toArray();
  if (
    !pageSize ||
    !list.length ||
    list.length < pageSize ||
    pageSize + skipCount >= totalDocuments
  )
    return { list };

  return {
    nextPagetoken: createNextPageToken(threadId, pageSize, skipCount),
    list,
  };
};

export const updateInteraction = async (userId, threadId, interaction) =>
  await interactionCollection.updateOne(
    { userId, threadId },
    { $set: { userId, threadId, interaction } },
    { upsert: true }
  );
