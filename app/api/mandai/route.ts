export const runtime = "nodejs";

type OpenAIContent = { type?: string; text?: string };
type OpenAIOutput = { content?: OpenAIContent[] };

function extractAnswer(data: { output_text?: string; output?: OpenAIOutput[] }) {
  if (data.output_text?.trim()) return data.output_text.trim();
  return data.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text" && item.text?.trim())
    ?.text?.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const workstreams = Array.isArray(body.workstreams) ? body.workstreams.slice(0, 100) : [];
    const readiness = Number.isFinite(Number(body.readiness)) ? Number(body.readiness) : 0;

    if (!question) {
      return Response.json({ error: "Enter a delivery question for MANDAI." }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "MANDAI is not configured on this environment." }, { status: 503 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        max_output_tokens: 900,
        input: [
          {
            role: "system",
            content: `You are MANDAI, an AI delivery assistant inside a delivery-readiness tracker. Answer only from the supplied portfolio data. Focus on workstreams, blockers, risks, severity, owners, milestones, readiness, launch planning, mitigation actions, and leadership updates. If the question is outside delivery management, briefly redirect it. Never invent portfolio facts. Use concise Markdown with a direct answer followed by priorities and recommended actions.`,
          },
          {
            role: "user",
            content: `Question: ${question}\n\nPortfolio readiness: ${readiness}%\n\nWorkstreams:\n${JSON.stringify(workstreams, null, 2)}`,
          },
        ],
      }),
    }).finally(() => clearTimeout(timeout));

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const upstreamMessage = typeof data?.error?.message === "string" ? data.error.message : "OpenAI did not complete the request.";
      console.error("MANDAI upstream error", response.status, upstreamMessage);
      return Response.json({ error: response.status === 429 ? "MANDAI is busy right now. Please wait a moment and retry." : "MANDAI could not complete that request. Please try again." }, { status: response.status });
    }

    const answer = extractAnswer(data);
    if (!answer) return Response.json({ error: "MANDAI returned an empty response. Please retry." }, { status: 502 });
    return Response.json({ answer }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    console.error("MANDAI request failed", error);
    return Response.json({ error: timedOut ? "MANDAI took too long to respond. Please retry." : "Something went wrong while contacting MANDAI." }, { status: timedOut ? 504 : 500 });
  }
}
