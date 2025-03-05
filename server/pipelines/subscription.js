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
      as: "space",
    },
  },
  {
    $unwind: {
      path: "$space",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      subscriptionId: 1,
      isNewsletter: 1,
      space: {
        spaceId: 1,
        ownerId: 1,
        title: 1,
        description: 1,
        isPrivate: 1,
      },
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
      isNewsletter: 1,
      user: { name: 1, userId: 1 },
    },
  },
];
