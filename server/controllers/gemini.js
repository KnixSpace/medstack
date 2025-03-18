import { gemini } from "../config/gemini.js";
import {
  rephrasePrompt,
  spaceDescriptionPrompt,
  threadContentPrompt,
  titlePrompt,
} from "../constants/prompts.js";

export const generateTitle = async (ctx) => {
  const { prompt, type } = ctx.state.shared;

  const title = await gemini().generateContent(titlePrompt(prompt, type));

  ctx.body = title.response.text();
};

export const generateSpaceDescription = async (ctx) => {
  const { prompt, title = null } = ctx.state.shared;

  const description = await gemini().generateContent(
    spaceDescriptionPrompt(prompt, title)
  );

  ctx.body = description.response.text();
};

export const generateThreadContent = async (ctx) => {
  const { prompt, title = null, tone = null } = ctx.state.shared;

  const content = await gemini(0.7, 1250).generateContentStream(
    threadContentPrompt(prompt, title, tone)
  );

  ctx.set("Content-Type", "text/plain");
  ctx.set("Transfer-Encoding", "chunked");

  ctx.status = 200;

  for await (const chunk of content.stream) {
    ctx.res.write(chunk.text());
  }

  ctx.res.end();
};

export const rehrase = async (ctx) => {
  const { rephraseContent } = ctx.state.shared;

  const data = await gemini(0.7, 500).generateContent(
    rephrasePrompt(rephraseContent)
  );

  ctx.body = data.response.text();
};
