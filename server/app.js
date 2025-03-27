import KOA from "koa";
import koaparser from "koa-bodyparser";
import { routes } from "./routes/index.js";
import cors from "@koa/cors";

export const app = new KOA();

app.use(cors({ origin: "*", credentials: true }));

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
