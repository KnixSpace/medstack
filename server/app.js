import KOA from "koa";
import koaparser from "koa-bodyparser";
import { routes } from "./routes/index.js";

export const app = new KOA();
app.use(koaparser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

routes(app);
