import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemMessage = {
    role: "system",
    content: `Helpful assistant.`,
  };
  const result = streamText({
    model: openai("gpt-4o"),
    messages: [systemMessage, ...messages],
    maxTokens: 200,
  });

  return result.toDataStreamResponse();
}
