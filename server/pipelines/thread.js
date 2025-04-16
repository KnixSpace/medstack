import { pipeline } from "stream";
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
      pipeline: [
        {
          $project: {
            _id: 0,
            title: 1,
          },
        },
      ],
      as: "spaceDetails",
    },
  },
  {
    $addFields: { spaceDetails: { $arrayElemAt: ["$spaceDetails", 0] } },
  },
  {
    $lookup: {
      from: "user",
      localField: "ownerId",
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
      as: "ownerDetails",
    },
  },
  {
    $addFields: { ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] } },
  },
  {
    $lookup: {
      from: "interaction",
      let: { threadId: "$threadId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$threadId", "$$threadId"] } } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ],
      as: "interactionsCount",
    },
  },
  {
    $addFields: {
      interactionsCount: {
        $ifNull: [{ $arrayElemAt: ["$interactionsCount.total", 0] }, 0],
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
