import { client } from "./database.js";

const interactionCollection = client
  .db(process.env.DB_NAME)
  .collection("interaction");

export const updateInteraction = async (userId, threadId, interaction) =>
  await interactionCollection.updateOne(
    { userId, threadId },
    { $set: { userId, threadId, interaction } },
    { upsert: true }
  );
