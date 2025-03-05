import { v4 as uuidV4 } from "uuid";
import {
  createSpace,
  updateSpace,
} from "../db/space.js";
import {
  createSubscription,
  deleteSubscription,
  readSpaceSubscribers,
  readUserSubscriptions,
  updateSubscription,
} from "../db/subscription.js";

export const addNewSpace = async (ctx) => {
  const { title, description, isPrivate } = ctx.state.shared;
  const { userId } = ctx.request.user;

  const space = {
    spaceId: uuidV4(),
    ownerId: userId,
    title,
    description,
    isPrivate: isPrivate !== undefined ? isPrivate : true,
    createdOn: new Date(),
    updatedOn: new Date(),
  };
  await createSpace(space);

  ctx.body = { message: "new space created" };
};

export const getSpaceSubscribers = async (ctx) => {
  const spaceId = ctx.state.space.spaceId;
  const subscribers = await readSpaceSubscribers(spaceId);
  if (!subscribers) {
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
