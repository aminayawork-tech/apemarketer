import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const dates: string[] = body.dates ?? [`${new Date().toDateString()}`];
    const count = dates.length;

    const prompt = `You are a master guerrilla marketing storyteller. Generate exactly ${count} short success ${count === 1 ? "story" : "stories"}, one for each of these days: ${dates.join(" | ")}.

Each story should feel specific and fresh. Vary the industries, cities, and tactics across all stories.

Format each story exactly like this — separate stories with a line containing only "---":

## [Specific, compelling story title]

**[Business Type]** · [One-line tactic description]

[2-3 paragraphs. Open with the business situation. Describe the guerrilla idea they came up with. Detail exactly how they executed it: day of week, money spent, specific locations, what they said or did. Close with concrete measurable results: percentage increases, dollar amounts, new customer counts.]

> **The Lesson:** [One clear, immediately actionable takeaway any small business owner could apply this week]

---

Write with warm, mentor-over-coffee energy. Use specific details: real-sounding business names, actual street names, real cities, dollar amounts. Make readers think "I could do that." No emojis. No filler.`;

    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API ?? process.env.ANTHROPIC_API_KEY,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (client.messages as any).stream({
      model: "claude-opus-4-7",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
