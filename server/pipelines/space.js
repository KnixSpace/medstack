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
      as: "ownerDetails",
    },
  },
  {
    $addFields: {
      ownerDetails: {
        $arrayElemAt: ["$ownerDetails", 0],
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
      ownerId: 0,
      ownerDetails: {
        _id: 0,
        email: 0,
        password: 0,
        role: 0,
        createdOn: 0,
        updatedOn: 0,
        isVerified: 0,
        subscribedTags: 0,
      },
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
      createdOn: 0,
      updatedOn: 0,
    },
  },
];
