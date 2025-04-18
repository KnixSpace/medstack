import {
  spaceDetailsPipeline,
  spacesWithSubscriptionCountPipeline,
} from "../pipelines/space.js";
import { client } from "./database.js";

const spaceCollection = client.db(process.env.DB_NAME).collection("space");

export const createSpace = async (space) =>
  await spaceCollection.insertOne(space);

export const readSpace = async (filter, options) =>
  await spaceCollection.findOne(filter, options);

export const readAllSpaces = async (filter, options) =>
  await spaceCollection.find(filter, options).toArray();

export const readSuggestedSpaces = async (tags) => {
  const pipeline = [
    {
      $lookup: {
        from: "thread", // Join with the threads collection
        localField: "spaceId",
        foreignField: "spaceId",
        as: "threads",
      },
    },
    {
      $unwind: "$threads", // Flatten the threads array
    },
    {
      $unwind: "$threads.tags", // Flatten the tags array inside each thread
    },
    {
      $match: {
        "threads.tags.name": { $in: tags }, // Match the tags you're interested in
      },
    },
    {
      $group: {
        _id: "$_id", // Group by the space's _id
        spaceDetails: { $first: "$$ROOT" }, // Retain the full space document
        threadCount: { $sum: 1 }, // Count the number of threads that match the tags
      },
    },
    {
      $lookup: {
        from: "user", // Lookup the owner details from the users collection
        localField: "spaceDetails.ownerId", // Match by ownerId
        foreignField: "userId", // Assuming ownerId is unique in the users collection
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails", // Unwind to get the owner details
    },
    {
      $project: {
        spaceId: "$spaceDetails.spaceId",
        title: "$spaceDetails.title",
        description: "$spaceDetails.description",
        coverImage: "$spaceDetails.coverImage",
        threadCount: 1, // Include the thread count
        ownerName: "$ownerDetails.name", // Include the owner's name
      },
    },
    {
      $sort: {
        threadCount: -1,
      },
    },
  ];

  return await spaceCollection.aggregate(pipeline).toArray();
};

export const readSpaceDetails = async (spaceId) =>
  await spaceCollection.aggregate(spaceDetailsPipeline(spaceId)).toArray();

export const readSpacesWithSubscriberCounts = async (ownerId) =>
  await spaceCollection
    .aggregate(spacesWithSubscriptionCountPipeline(ownerId))
    .toArray();

export const updateSpace = async (spaceId, data) =>
  await spaceCollection.updateOne(
    { spaceId },
    { $set: { ...data, updatedOn: new Date() } }
  );
