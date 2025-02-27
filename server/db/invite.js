import { client } from "./database.js";

const inviteCollection = client.db(process.env.DB_NAME).collection("invite");

export const createInvite = async (invite) =>
  await inviteCollection.insertOne(invite);

export const readInvite = async (filter, option) =>
  await inviteCollection.findOne(filter, option);

export const updateInvite = async (inviteId, data) =>
  await inviteCollection.updateOne(
    { inviteId },
    { $set: { ...data, updatedOn: new Date() } }
  );
