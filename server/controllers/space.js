import { v4 as uuidV4 } from "uuid";
import {
  createSpace,
  readAllSpaces,
  readSpaceDetails,
  readSpacesWithSubscriberCounts,
  updateSpace,
} from "../db/space.js";
import {
  createSubscription,
  deleteSubscription,
  readSpaceSubscribers,
  readUserSubscriptions,
  updateSubscription,
} from "../db/subscription.js";
import { readThreadsOfSpace } from "../db/thread.js";

export const addNewSpace = async (ctx) => {
  const { title, description, isPrivate, coverImage } = ctx.state.shared;
  const { userId } = ctx.request.user;

  const space = {
    spaceId: uuidV4(),
    ownerId: userId,
    title,
    description,
    coverImage,
    isPrivate: isPrivate !== undefined ? isPrivate : false,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createSpace(space);

  ctx.body = { message: "new space created", data: { spaceId: space.spaceId } };
};

export const modifySpace = async (ctx) => {
  const { spaceId } = ctx.state.space;
  await updateSpace(spaceId, ctx.state.shared);
  ctx.body = { message: "space updated successfully" };
};

export const subscribeSpace = async (ctx) => {
  const { userId } = ctx.request.user;
  const { spaceId } = ctx.state.space;

  const subscription = {
    subscriptionId: uuidV4(),
    userId,
    spaceId,
    isNewsletter: false,
    createdOn: new Date(),
    updatedOn: new Date(),
  };

  await createSubscription(subscription);
  ctx.body = { message: "successfully subscribed to space" };
};

export const unsubscribeSpace = async (ctx) => {
  const { subscriptionId } = ctx.state.subscription;

  await deleteSubscription(subscriptionId);
  ctx.body = { message: "Unsubscribed succesfully" };
};

export const toggleSpaceNewsletter = async (ctx) => {
  const { subscriptionId, isNewsletter } = ctx.state.subscription;

  await updateSubscription(subscriptionId, { isNewsletter: !isNewsletter });
  ctx.body = { message: "updated subscription" };
};

export const getSpace = async (ctx) => {
  const { spaceId } = ctx.state.space;
  const space = await readSpaceDetails(spaceId);
  ctx.body = {
    message: "space details found",
    data: space[0],
  };
};

export const getSpaceThreads = async (ctx) => {
  const { spaceId } = ctx.state.space;
  const query = ctx.state.query || {};
  const { tags = [], pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const filters = {
    sort: query?.sort,
    tags,
  };

  const threads = await readThreadsOfSpace(
    spaceId,
    filters,
    pageSize,
    skipCount
  );

  if (!threads.list.length) {
    ctx.body = { message: "no threads to show" };
    return;
  }
  ctx.body = threads;
};

export const getOwnerSpacesWithSubscribersCount = async (ctx) => {
  const { userId: ownerId } = ctx.state.owner;
  const spaces = await readSpacesWithSubscriberCounts(ownerId);
  if (!spaces.length) {
    ctx.body = { message: "no space found" };
    return;
  }
  ctx.body = { message: "spaces found", data: spaces };
};

export const getNamesOfOwnerSpaces = async (ctx) => {
  const ownerId = ctx.state.owner.userId;

  const spaces = await readAllSpaces(
    { ownerId },
    { projection: { spaceId: 1, title: 1 } }
  );
  if (!spaces.length) {
    ctx.body = { message: "no space found" };
    return;
  }

  ctx.body = {
    message: "spaces found",
    data: spaces,
  };
};

export const getSpaceSubscribers = async (ctx) => {
  const { spaceId } = ctx.state.space;
  const { pageSize = null, skipCount = 0 } = ctx.state.page || {};

  const subscribers = await readSpaceSubscribers(spaceId, pageSize, skipCount);
  if (!subscribers.list.length) {
    ctx.body = { message: "no subscriber found" };
  }
  ctx.body = subscribers;
};

export const getUserSubscribedSpaces = async (ctx) => {
  const userId = ctx.request.user.userId;

  const subscriptions = await readUserSubscriptions(userId);
  if (!subscriptions.length) {
    ctx.body = { message: "no subscription found" };
    return;
  }
  ctx.body = subscriptions;
};
