import Router from "@koa/router";
const router = new Router();

router.get("/", async (ctx) => {
  ctx.body = "🧠 Server is running fantastic";
});

export default router;
