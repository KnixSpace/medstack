export const threadDetailsPipeline = (threadId) => [
  {
    $match: {
      threadId: "1eb2d849-3c59-4dd3-a803-85c2d1445668",
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
    $addFields: { space: { $arrayElemAt: ["$space", 0] } },
  },
  {
    $lookup: {
      from: "user",
      localField: "ownerId",
      foreignField: "userId",
      as: "owner",
    },
  },
  {
    $addFields: { owner: { $arrayElemAt: ["$owner", 0] } },
  },
  {
    $lookup: {
      from: "interaction",
      let: { threadId: "$threadId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$threadId", "$$threadId"] } } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ],
      as: "interactions",
    },
  },
  {
    $addFields: {
      interactions: {
        $ifNull: [{ $arrayElemAt: ["$interactions.total", 0] }, 0],
      },
    },
  },
  {
    $project: {
      space: {
        _id: 0,
        spaceId: 0,
        ownerId: 0,
        createdOn: 0,
        updatedOn: 0,
      },
      owner: {
        _id: 0,
        password: 0,
        email: 0,
        userId: 0,
        role: 0,
        subscribedTags: 0,
        createdOn: 0,
        updatedOn: 0,
      },
    },
  },
];
