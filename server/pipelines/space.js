export const spacesWithSubscriptionCountPipeline = (ownerId) => [
  {
    $match: {
      ownerId,
    },
  },
  {
    $lookup: {
      from: "subscription",
      localField: "spaceId",
      foreignField: "spaceId",
      pipeline: [
        {
          $count: "count",
        },
      ],
      as: "subscribers",
    },
  },
  {
    $unwind: {
      path: "$subscribers",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      subscribers: {
        $ifNull: ["$subscribers.count", 0],
      },
    },
  },
  {
    $project: {
      _id: 0,
      ownerId: 0,
      createdOn: 0,
      updatedOn: 0,
    },
  },
];
