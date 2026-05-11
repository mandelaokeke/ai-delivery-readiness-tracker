export async function POST(req: Request) {
  try {
    const { question, workstreams, readiness } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          answer:
            "## MANDAI Configuration Error\n\nOpenAI is not connected yet. Add `OPENAI_API_KEY` to your `.env.local` file, then restart the dev server.",
        },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: `You are MANDAI, an AI delivery assistant inside a Launch Readiness Tracker.

You ONLY answer questions about the provided workstreams and project delivery context.
Allowed topics:
- workstreams
- project delivery
- blockers
- risks
- severity
- readiness score
- owners
- milestones
- client-ready updates
- launch planning
- delivery priorities
- mitigation actions

If the user asks anything outside this scope, politely refuse and redirect them back to the workstreams.
Do not answer sports, politics, entertainment, health, finance, immigration, schoolwork, coding, or general knowledge unless it is directly tied to the provided workstream data.

Always answer in Markdown.
Use headings, bullets, and clear recommendations.
Base your answer only on the provided workstream data.
Do not invent workstreams that are not provided.`,
          },
          {
            role: "user",
            content: `Question: ${question}

Readiness Score: ${readiness}%

Workstreams:
${JSON.stringify(workstreams, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return Response.json(
        {
          answer:
            "## MANDAI API Error\n\nMANDAI could not reach OpenAI successfully. Check your API key, billing status, and model access.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const answer =

  data.output_text ||

  data.output?.[0]?.content?.[0]?.text ||

  data.output?.[0]?.content?.[0]?.text?.value ||

  "";

return Response.json({

  answer:

    answer ||

    `## MANDAI Error\n\nI could not generate a response right now.\n\nDebug: ${JSON.stringify(

      data,

      null,

      2

    )}`,

});} catch {
    return Response.json(
      {
        answer:
          "## MANDAI Error\n\nSomething went wrong while generating the response.",
      },
      { status: 500 }
    );
  }
}