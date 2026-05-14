import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json().catch(() => ({ date: new Date().toDateString() }));

    const prompt = `You are a master storyteller specializing in guerrilla marketing success stories, deeply inspired by Jay Conrad Levinson's "Guerrilla Marketing" books.

Generate exactly 5 short guerrilla marketing success stories. Today is ${date} — make these stories feel fresh and specific to this moment. Vary the industries, cities, and tactics across the 5 stories.

Choose 5 different business types (restaurants, food trucks, retail boutiques, gyms, salons, auto shops, coffee shops, bookstores, dental offices, pet shops, hardware stores, real estate agents, service businesses, etc.).

Format each story exactly like this — do not deviate from this structure:

## [Specific, compelling story title — not generic]

**[Business Type]** · [One-line tactic description]

[2-3 paragraphs. Open with the business situation: struggling, new, or facing a specific challenge. Describe the guerrilla idea they came up with. Then detail exactly how they executed it: day of week, money spent, specific locations, what they said or did. Close with concrete measurable results: percentage increases, dollar amounts, new customer counts, press mentions, etc.]

> **The Lesson:** [One clear, immediately actionable takeaway any small business owner could apply this week]

---

Write with the warm, mentor-over-coffee energy of Levinson himself. Use specific details: real-sounding business names, actual street names, real cities, dollar amounts. Make readers think "I could do that." No emojis. No filler. Just great stories.`;

    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API ?? process.env.ANTHROPIC_API_KEY,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (client.messages as any).stream({
      model: "claude-opus-4-7",
      max_tokens: 4096,
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
