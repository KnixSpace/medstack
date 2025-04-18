import Router from "@koa/router";
import {
  generateSpaceDescription,
  generateThreadContent,
  generateTitle,
  rephrase,
} from "../controllers/index.js";
import { validate } from "../utils/validate.js";
import {
  validateGeminiPrompt,
  validatePromptTitle,
  validatePromptTitleType,
  validatePromptTone,
  validateRephraseContent,
} from "../validators/gemini.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = new Router({ prefix: "/api/v1/gemini" });

router.post(
  "/generate/title",
  isAuthenticated("E"),
  validate([validateGeminiPrompt, validatePromptTitleType]),
  generateTitle
);

router.post(
  "/generate/space-description",
  isAuthenticated("E"),
  validate([validateGeminiPrompt, validatePromptTitle]),
  generateSpaceDescription
);

router.post(
  "/generate/thread-content",
  // isAuthenticated("E"),
  validate([validateGeminiPrompt, validatePromptTitle, validatePromptTone]),
  generateThreadContent
);

router.post(
  "/rephrase",
  isAuthenticated("E"),
  validate([validateRephraseContent]),
  rephrase
);

export default router;
