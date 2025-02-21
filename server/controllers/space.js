import { v4 as uuidV4 } from "uuid";
import { createSpace, readAllSpaces, updateSpace } from "../db/space.js";

export const addNewSpace = async (ctx) => {
  const { title, description, isPrivate } = ctx.request.body;
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

export const getAllSpaces = async (ctx) => {
  const spaces = await readAllSpaces();
  if (!spaces.length) {
    ctx.body = { message: "No space found" };
    return;
  }

  ctx.body = spaces;
};

export const getOwnerSpaces = async (ctx) => {
  const { userId } = ctx.request.user;

  const spaces = await readAllSpaces({ ownerId: userId });
  if (!spaces.length) {
    ctx.body = { message: "No space found" };
    return;
  }

  ctx.body = spaces;
};

export const modifySpace = async (ctx) => {
  const { spaceId } = ctx.params;
  await updateSpace(spaceId, ctx.state.data);
  ctx.body = { message: "space updated successfully" };
};
