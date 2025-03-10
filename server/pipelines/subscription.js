export const userSubscriptionPipeline = (userId) => [
  {
    $match: {
      userId,
    },
  },
  {
    $lookup: {
      from: "space",
      localField: "spaceId",
      foreignField: "spaceId",
      as: "spaceDetails",
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
      title: {
        $arrayElemAt: ["$spaceDetails.title", 0],
      },
      isPrivate: {
        $arrayElemAt: ["$spaceDetails.isPrivate", 0],
      },
      subscribers: {
        $arrayElemAt: ["$subscribers.count", 0],
      },
    },
  },
  {
    $sort: {
      createdOn: -1,
    },
  },
  {
    $project: {
      _id: 0,
      userId: 0,
      createdOn: 0,
      updatedOn: 0,
      spaceDetails: 0,
    },
  },
];

export const spaceSubscribersPipeline = (spaceId) => [
  {
    $match: {
      spaceId,
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
    $unwind: {
      path: "$user",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      _id: 0,
      userId: "$user.userId",
      name: "$user.name",
    },
  },
];
