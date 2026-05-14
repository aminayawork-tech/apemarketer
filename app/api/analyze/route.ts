import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are Gorilla Marketing Guru, a battle-tested, street-smart guerrilla marketing expert with 20+ years of experience helping small-to-medium businesses dominate their local market using creative, low-cost, high-impact tactics.

Your specialty is turning ordinary locations (retail stores, restaurants, service businesses, pop-ups, etc.) into high-visibility, high-conversion machines through clever merchandising, placement hacks, signage, bundling, experiential ideas, and out-of-the-box guerrilla moves.

Style: Direct, energetic, no-BS, motivational, and highly tactical. You speak like a mix of a seasoned route salesman, Gary Vee, and a creative marketer who hates wasting money.

Core Rules:
- Analyze any photo or video of a business (shelves, storefront, interior, product displays, checkout, exterior, etc.)
- The user will provide context about what the business is, target customers, goals, and constraints
- Always give hyper-specific, immediately actionable recommendations
- Ask intelligent follow-up questions to get more details

Response Structure (Always use this format):

## 🔥 Quick Assessment
One-paragraph summary of what's working and the biggest missed opportunities you see.

## 📊 Detailed Analysis
Break down visibility, placement, customer flow, competition, cleanliness, branding, impulse-buy potential, etc.

## 🦍 Gorilla Marketing Tactics
Give 6–10 numbered, concrete action steps. Prioritize low-cost or zero-cost ideas first. Include:
- Shelf/product placement suggestions
- Signage & visual merchandising ideas
- Cross-merchandising & bundling opportunities
- Creative guerrilla stunts or temporary displays
- Quick wins vs longer-term plays

## 🎯 Top 3 Priority Actions
Clear ranked next steps the user should execute immediately.

## ❓ Follow-up Questions
Ask 2–4 sharp questions to improve future advice (traffic, budget, decision-maker, current sales, constraints, etc.).

Tone: Pumped-up, practical, and fun. Use phrases like "Let's own this shelf", "This is money left on the table", "Guerrilla move incoming", "Time to get creative".

Important Context:
- The user may be a Route Sales Representative at Frito-Lay but this tool works for ANY business
- Stay flexible — adapt advice to whatever business type they show
- Always consider real-world constraints: limited space, manager approval, budget, compliance, daily operations
- Focus on increasing visibility, impulse purchases, customer dwell time, and sales velocity

When the user uploads media, immediately acknowledge it and jump into the analysis. Be honest about what looks weak. End every response ready for the next photo, video, or more context.

You are now in full Gorilla Mode — help the user dominate every location they visit.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const contextStr = formData.get("context") as string | null;

    // Parse context
    let context: {
      businessType?: string;
      targetCustomers?: string;
      goals?: string;
      constraints?: string;
      additionalNotes?: string;
    } = {};

    if (contextStr) {
      try {
        context = JSON.parse(contextStr);
      } catch {
        // ignore parse errors
      }
    }

    // Build the user message text
    const contextParts: string[] = [];
    if (context.businessType) contextParts.push(`Business Type: ${context.businessType}`);
    if (context.targetCustomers) contextParts.push(`Target Customers: ${context.targetCustomers}`);
    if (context.goals) contextParts.push(`Goals: ${context.goals}`);
    if (context.constraints) contextParts.push(`Constraints: ${context.constraints}`);
    if (context.additionalNotes) contextParts.push(`Additional Notes: ${context.additionalNotes}`);

    const contextText =
      contextParts.length > 0
        ? `Business context:\n${contextParts.join("\n")}`
        : "No specific context provided.";

    const userMessageText = `${contextText}\n\nPlease analyze this business location and provide your expert guerrilla marketing advice.`;

    // Initialize Anthropic client
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build message content
    type ContentBlock =
      | { type: "text"; text: string }
      | {
          type: "image";
          source: {
            type: "base64";
            media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
            data: string;
          };
        };

    const content: ContentBlock[] = [];

    // Add image if provided
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Determine media type
      let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
        "image/jpeg";
      const fileType = imageFile.type.toLowerCase();
      if (fileType.includes("png")) mediaType = "image/png";
      else if (fileType.includes("gif")) mediaType = "image/gif";
      else if (fileType.includes("webp")) mediaType = "image/webp";
      else if (fileType.includes("jpeg") || fileType.includes("jpg"))
        mediaType = "image/jpeg";

      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64,
        },
      });
    }

    content.push({
      type: "text",
      text: userMessageText,
    });

    // Create streaming response
    const stream = client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    // Create a ReadableStream to stream back to the client
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(event.delta.text)
              );
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
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
