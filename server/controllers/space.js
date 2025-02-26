import { v4 as uuidV4 } from "uuid";
import { createSpace, readAllSpaces, updateSpace } from "../db/space.js";

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

export const getOwnerSpaces = async (ctx) => {
  const { userId: ownerId } = ctx.request.user;

  const spaces = await readAllSpaces({ ownerId });
  if (!spaces.length) {
    ctx.body = { message: "No space found" };
    return;
  }

  ctx.body = spaces;
};

export const modifySpace = async (ctx) => {
  const { spaceId } = ctx.params;
  await updateSpace(spaceId, ctx.state.shared);
  ctx.body = { message: "space updated successfully" };
};
