import { contentTone } from "../constants/enums.js";
import { buildPropertyError } from "../utils/validate.js";

export const validateGeminiPrompt = (ctx, errors) => {
  const { prompt } = ctx.request.body;

  if (!prompt) {
    errors.push(buildPropertyError("prompt", "prompt is required"));
  } else if (typeof prompt !== "string") {
    errors.push(buildPropertyError("prompt", "prompt must be a string"));
  } else if (
    prompt.split(/\s+/).length < 2 ||
    prompt.split(/\s+/).length > 64
  ) {
    errors.push(
      buildPropertyError("prompt", "prompt must be of 4 to 64 words")
    );
  }

  ctx.state.shared = Object.assign(
    { prompt: prompt.trim().split(/\s+/).join(" ") },
    ctx.state.shared
  );
};

export const validatePromptTitleType = (ctx, errors) => {
  const { type } = ctx.request.body;

  if (!type) {
    errors.push(buildPropertyError("type", "type is required"));
  } else if (typeof type !== "string") {
    errors.push(buildPropertyError("type", "type must be a string"));
  } else if (!["space", "thread"].includes(type.toLowerCase())) {
    errors.push(
      buildPropertyError("type", "type must be either 'space' or 'thread'")
    );
  }

  ctx.state.shared = Object.assign({ type: type }, ctx.state.shared);
};

export const validatePromptTitle = (ctx, errors) => {
  const { title } = ctx.request.body;
  if (!title) return;

  if (typeof title !== "string") {
    errors.push(buildPropertyError("title", "title must be a string"));
  } else if (title.split(/\s+/).length < 2 || title.split(/\s+/).length > 16) {
    errors.push(buildPropertyError("title", "title must be of 2 to 16 words"));
  }

  ctx.state.shared = Object.assign(
    { title: title.trim().split(/\s+/).join(" ") },
    ctx.state.shared
  );
};

export const validatePromptTone = (ctx, errors) => {
  const { tone } = ctx.request.body;
  if (!tone) return;

  if (tone && typeof tone !== "string") {
    errors.push(buildPropertyError("tone", "tone must be a string"));
  } else if (!contentTone.includes(tone.toLowerCase())) {
    errors.push(buildPropertyError("tone", "not a vlaid tone"));
  }

  ctx.state.shared = Object.assign({ tone: tone }, ctx.state.shared);
};

export const validateRephraseContent = (ctx, errors) => {
  const { rephraseContent } = ctx.request.body;

  if (!rephraseContent) {
    errors.push(
      buildPropertyError("rephraseContent", "rephraseContent is required")
    );
  } else if (typeof rephraseContent !== "string") {
    errors.push(
      buildPropertyError("rephraseContent", "rephraseContent must be a string")
    );
  } else if (
    rephraseContent.split(/\s+/).length < 4 ||
    rephraseContent.split(/\s+/).length > 128
  ) {
    errors.push(
      buildPropertyError(
        "rephraseContent",
        "rephraseContent must be of 4 to 128 words"
      )
    );
  }

  ctx.state.shared = Object.assign(
    { rephraseContent: rephraseContent.trim().split(/\s+/).join(" ") },
    ctx.state.shared
  );
};
