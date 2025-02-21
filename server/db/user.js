import { client } from "./database.js";

const userCollection = client.db(process.env.DB_NAME).collection("user");

export const createUser = async (user) => await userCollection.insertOne(user);

export const readUser = async (filter, options) =>
  await userCollection.findOne(filter, options);

export const updateUser = async (userId, data) =>
  await userCollection.updateOne(
    { userId },
    { $set: { ...data, updatedOn: new Date() } }
  );
