export const spaceDetailsPipeline = (spaceId) => [
  {
    $match: {
      spaceId,
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "ownerId",
      foreignField: "userId",
      pipeline: [{ $project: { name: 1, avatar: 1 } }],
      as: "ownerDetails",
    },
  },
  {
    $addFields: {
      ownerName: {
        $arrayElemAt: ["$ownerDetails.name", 0],
      },
      ownerAvatar: {
        $arrayElemAt: ["$ownerDetails.avatar", 0],
      },
    },
  },
  {
    $lookup: {
      from: "subscription",
      localField: "spaceId",
      foreignField: "spaceId",
      pipeline: [
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
      as: "subscribers",
    },
  },
  {
    $addFields: {
      subscribers: {
        $ifNull: [
          {
            $arrayElemAt: ["$subscribers.count", 0],
          },
          0,
        ],
      },
    },
  },
  {
    $project: {
      _id: 0,
      ownerDetails: 0,
    },
  },
];

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
      updatedOn: 0,
    },
  },
];
