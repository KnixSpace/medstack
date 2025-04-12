import { client } from "./database.js";

const inviteCollection = client.db(process.env.DB_NAME).collection("invite");

export const createInvite = async (invites) =>
  await inviteCollection.insertMany(invites);

export const readInvite = async (filter, option) =>
  await inviteCollection.findOne(filter, option);

export const readAllInvites = async (filter, options) =>
  await inviteCollection.find(filter, options).toArray();

export const readInvitedEditors = async (ownerId) =>
  await inviteCollection
    .aggregate([
      {
        $match: {
          ownerId,
          isAccepted: true,
          role: "E",
        },
      },
      {
        $project: {
          _id: 0,
          inviteId: 1,
          userEmail: 1,
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "userEmail",
          foreignField: "email",
          pipeline: [
            {
              $project: {
                _id: 0,
                password: 0,
              },
            },
          ],
          as: "editors",
        },
      },
      {
        $unwind: "$editors",
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$editors"],
          },
        },
      },
      {
        $project: {
          editors: 0,
        },
      },
    ])
    .toArray();

export const updateInvite = async (inviteId, data) =>
  await inviteCollection.updateOne(
    { inviteId },
    { $set: { ...data, updatedOn: new Date() } }
  );

export const deleteInvite = async (inviteId) =>
  await inviteCollection.deleteOne({ inviteId });
