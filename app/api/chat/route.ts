import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const CHAT_SYSTEM_PROMPT = `You are Gorilla Marketing Guru, a battle-tested guerrilla marketing expert. You've already provided an initial location analysis. Now answer follow-up questions with the same direct, tactical, no-BS style.

Keep answers focused and actionable. Reference the initial analysis when relevant. Every answer should end with a clear next step. Do not use emojis.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, initialAnalysis, context } = await request.json();

    const contextParts: string[] = [];
    if (context.businessType) contextParts.push(`Business Type: ${context.businessType}`);
    if (context.targetCustomers) contextParts.push(`Target Customers: ${context.targetCustomers}`);
    if (context.goals) contextParts.push(`Goals: ${context.goals}`);
    if (context.constraints) contextParts.push(`Constraints: ${context.constraints}`);
    if (context.additionalNotes) contextParts.push(`Additional Notes: ${context.additionalNotes}`);

    const contextText = contextParts.length > 0 ? contextParts.join("\n") : "No specific context provided.";

    // Full history: initial exchange + follow-ups
    const fullMessages = [
      {
        role: "user",
        content: `Business context:\n${contextText}\n\nPlease analyze this business location.`,
      },
      {
        role: "assistant",
        content: initialAnalysis,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API ?? process.env.ANTHROPIC_API_KEY,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (client.messages as any).stream({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages: fullMessages,
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
