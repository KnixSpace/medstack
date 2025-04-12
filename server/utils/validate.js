import Promise from "bluebird";

export const buildPropertyError = (property, error) => ({
  property,
  error,
});

export const validate = (validators) => async (ctx, next) => {
  const errors = [];
  await Promise.each(validators, async (validator) => {
    await validator(ctx, errors);
  });

  if (errors.length) {
    ctx.status = 400;
    ctx.body = { errors };
    return;
  }
  return next();
};
