import { threadStatus } from "../constants/enums.js";

export const threadDetailsPipeline = (threadId) => [
  {
    $match: {
      threadId,
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

export const featuredThreadsPipeline = (
  tags = null,
  threadsListingType = "SUGGESTED"
) => {
  const matchStage = tags ? { tags: { $in: tags } } : {};
  const sortStage =
    threadsListingType === "TRENDING"
      ? { interactions: -1 }
      : { interactions: -1, createdOn: -1 };

  return [
    {
      $match: { status: threadStatus.published, ...matchStage },
    },
    {
      $lookup: {
        from: "space",
        localField: "spaceId",
        foreignField: "spaceId",
        pipeline: [{ $project: { _id: 0, title: 1 } }],
        as: "space",
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "ownerId",
        foreignField: "userId",
        pipeline: [{ $project: { _id: 0, name: 1 } }],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "interaction",
        localField: "threadId",
        foreignField: "threadId",
        pipeline: [
          {
            $match: {
              interaction: { $in: ["like"] },
            },
          },
          {
            $group: {
              _id: "$threadId",
              count: { $sum: 1 },
            },
          },
        ],
        as: "interactions",
      },
    },
    {
      $addFields: {
        spaceTitle: {
          $ifNull: [{ $arrayElemAt: ["$space.title", 0] }, null],
        },
        ownerName: {
          $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, null],
        },
        interactions: {
          $ifNull: [
            {
              $arrayElemAt: ["$interactions.count", 0],
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        spaceId: 0,
        editorId: 0,
        ownerId: 0,
        updatedOn: 0,
        status: 0,
        space: 0,
        user: 0,
      },
    },
    {
      $sort: sortStage,
    },
  ];
};
