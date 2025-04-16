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
      pipeline: [
        {
          $project: {
            _id: 0,
            name: 1,
            avatar: 1,
          },
        },
      ],
      as: "user",
    },
  },
  {
    $addFields: {
      userName: { $arrayElemAt: ["$user.name", 0] },
      userAvatar: { $arrayElemAt: ["$user.avatar", 0] },
    },
  },
  {
    $project: {
      _id: 0,
      user: 0,
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
      pipeline: [
        {
          $project: {
            _id: 0,
            name: 1,
            avatar: 1,
          },
        },
      ],
      as: "user",
    },
  },
  {
    $addFields: {
      userName: { $arrayElemAt: ["$user.name", 0] },
      userAvatar: { $arrayElemAt: ["$user.avatar", 0] },
    },
  },
  {
    $project: {
      _id: 0,
      user: 0,
    },
  },
  {
    $sort: {
      createdOn: -1,
    },
  },
];
