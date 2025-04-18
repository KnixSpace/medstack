import { threadStatus } from "../constants/enums.js";

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
      from: "user",
      localField: "spaceDetails.ownerId",
      foreignField: "userId",
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
      ownerDetails: 0,
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
      avatar: "$user.avatar",
      isNewsletter: "$isNewsletter",
      subscribedOn: "$createdOn",
    },
  },
];

export const subscribedSpacesThreadsPipeline = (userId) => [
  {
    $match: {
      userId,
    },
  },
  {
    $project: {
      _id: 0,
      spaceId: 1,
    },
  },
  {
    $lookup: {
      from: "thread",
      localField: "spaceId",
      foreignField: "spaceId",
      pipeline: [
        {
          $match: {
            status: threadStatus.published,
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
            as: "spaceTitle",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "ownerId",
            foreignField: "userId",
            pipeline: [{ $project: { _id: 0, name: 1 } }],
            as: "ownerName",
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
                  _id: null,
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
              $ifNull: [
                {
                  $arrayElemAt: ["$spaceTitle.title", 0],
                },
                null,
              ],
            },
            ownerName: {
              $ifNull: [
                {
                  $arrayElemAt: ["$ownerName.name", 0],
                },
                null,
              ],
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
            _id: 0,
            spaceId: 0,
            editorId: 0,
            ownerId: 0,
            updatedOn: 0,
            status: 0,
          },
        },
      ],
      as: "threads",
    },
  },
  {
    $unwind: {
      path: "$threads",
    },
  },
  {
    $replaceRoot: {
      newRoot: "$threads",
    },
  },
  {
    $sort: {
      createdOn: -1,
    },
  },
];

export const newsletterEnabledSubscriptionsPipeline = (spaceId) => [
  {
    $match: {
      spaceId,
      isNewsletter: true,
    },
  },
  {
    $project: {
      userId: 1,
    },
  },
  {
    $lookup: {
      from: "user",
      localField: "userId",
      foreignField: "userId",
      pipeline: [
        {
          $project: { _id: 0, email: 1, name: 1 },
        },
      ],
      as: "user",
    },
  },
  {
    $addFields: {
      user: {
        $ifNull: [{ $arrayElemAt: ["$user", 0] }, null],
      },
    },
  },
  {
    $group: {
      _id: null,
      users: { $addToSet: "$user" },
    },
  },
  {
    $project: {
      _id: 0,
    },
  },
];
