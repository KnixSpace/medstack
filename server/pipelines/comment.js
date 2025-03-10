export const threadCommentsWithRepliesCountPipeline = (threadId) => [
  {
    $match: {
      threadId,
      parentId: null,
    },
  },
  {
    $lookup: {
      from: "comment",
      let: { commentId: "$commentId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$parentId", "$$commentId"] },
          },
        },
        {
          $group: { _id: null, replyCount: { $sum: 1 } },
        },
      ],
      as: "replies",
    },
  },
  {
    $addFields: {
      replies: {
        $ifNull: [{ $arrayElemAt: ["$replies.replyCount", 0] }, 0],
      },
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
    $addFields: {
      user: { $arrayElemAt: ["$user", 0] },
    },
  },
  {
    $project: {
      _id: 0,
      user: {
        _id: 0,
        password: 0,
        createdOn: 0,
        updatedOn: 0,
        email: 0,
        userId: 0,
        subscribedTags: 0,
        isVerified: 0,
      },
    },
  },
  {
    $sort: {
      createdOn: -1,
    },
  },
];

export const threadCommentRepliesPipeline = (threadId, parentId) => [
  {
    $match: {
      threadId,
      parentId,
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
    $addFields: {
      user: { $arrayElemAt: ["$user", 0] },
    },
  },
  {
    $project: {
      _id: 0,
      user: {
        _id: 0,
        password: 0,
        createdOn: 0,
        updatedOn: 0,
        email: 0,
        userId: 0,
        subscribedTags: 0,
        isVerified: 0,
      },
    },
  },
  {
    $sort: {
      createdOn: -1,
    },
  },
];
