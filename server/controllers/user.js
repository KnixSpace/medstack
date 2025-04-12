import { readUser, updateUser } from "../db/user.js";

export const completeOnboarding = async (ctx) => {
  const { userId } = ctx.request.user;

  await updateUser(userId, {
    onboardComplete: true,
  });

  ctx.status = 200;
  ctx.body = {
    message: "User onboarding complete",
  };
};

export const getMyProfile = async (ctx) => {
  const { userId } = ctx.request.user;

  const user = await readUser(
    { userId },
    {
      projection: {
        _id: 0,
        password: 0,
        isVerified: 0,
        createdOn: 0,
        updatedOn: 0,
        onboardComplete: 0,
      },
    }
  );
  ctx.status = 200;
  ctx.body = {
    message: "User fetched successfully",
    data: user,
  };
};

export const getPublicProfile = async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    message: "User fetched successfully",
    data: ctx.state.user,
  };
};

export const getEditorOwnerInfo = async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    message: "User fetched successfully",
    data: ctx.state.owner,
  };
};

export const updateProfileData = async (ctx) => {
  const { userId } = ctx.request.user;

  await updateUser(userId, ctx.state.shared);
  ctx.status = 200;
  ctx.body = {
    message: "User data updated successfully",
  };
};
