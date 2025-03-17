import Router from "@koa/router";
const router = new Router();

router.get("/yoo", (ctx) => {
  console.log(ctx.path);
  ctx.body = "🧠 Server is running fantastic";
});

export default router;
