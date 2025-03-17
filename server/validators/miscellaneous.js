import { verifyJwt } from "../utils/jwt.js";
import { buildPropertyError } from "../utils/validate.js";

export const validatePagination = (ctx, errors) => {
  if (!ctx.state.query?.pageSize) return;

  const pageSize = ctx.state.query.pageSize;
  if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
    errors.push({
      field: "pageSize",
      message: "Page size must be a number between 1 and 100",
    });
    return;
  }

  const pageToken = ctx.state.query.pageToken;
  if (pageToken) {
    const data = verifyJwt(pageToken, process.env.JWT_PAGE_TOKEN_KEY);

    if (!data || !data.skipCount || data.skipCount < 0) {
      errors.push({
        field: "pageToken",
        message: "Invalid page token",
      });
      return;
    }

    const url = ctx.path;
    if (url.includes("/list/threads") || url.includes("/stats/subscribers")) {
      if (!data.itemId || data.itemId !== ctx.state.space.spaceId) {
        errors.push(buildPropertyError("pageToken", "invalid pageToken"));
        return;
      }
    }

    if (
      url.includes("/list/comments") ||
      url.includes("/list/reply") ||
      url.includes("/stats/interactions")
    ) {
      if (!data.itemId || data.itemId !== ctx.state.thread.threadId) {
        errors.push(buildPropertyError("pageToken", "invalid pageToken"));
        return;
      }
    }

    ctx.state.page = Object.assign(
      { pageSize: parseInt(pageSize), skipCount: data.skipCount },
      ctx.state.page
    );
  }

  ctx.state.page = Object.assign(
    { pageSize: parseInt(pageSize) },
    ctx.state.page
  );
};
