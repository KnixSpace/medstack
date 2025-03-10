import { client } from "./database.js";

const interactionCollection = client
  .db(process.env.DB_NAME)
  .collection("interaction");

export const readThreadIntractions = async (threadId) =>
  await interactionCollection
    .aggregate([
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
          name: { $arrayElemAt: ["$user.name", 0] },
        },
      },
      {
        $project: {
          interaction: 1,
          name: 1,
        },
      },
    ])
    .toArray();

export const updateInteraction = async (userId, threadId, interaction) =>
  await interactionCollection.updateOne(
    { userId, threadId },
    { $set: { userId, threadId, interaction } },
    { upsert: true }
  );
