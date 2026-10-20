
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/gemini")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            return Response.json(
              { error: "Server API key is not configured." },
              { status: 500 },
            );
          }

          const body = await request.json();
          const { system, messages, json } = body;

          if (
            typeof system !== "string" ||
            !Array.isArray(messages) ||
            messages.length === 0 ||
            messages.length > 30 ||
            messages.some(
              (m: any) =>
                !["user", "model"].includes(m?.role) ||
                typeof m?.text !== "string" ||
                m.text.length > 12000,
            )
          ) {
            return Response.json(
              { error: "Invalid request." },
              { status: 400 },
            );
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: system.slice(0, 12000) }],
                },
                contents: messages.map((m: { role: string; text: string }) => ({
                  role: m.role,
                  parts: [{ text: m.text }],
                })),
                generationConfig: json
                  ? { responseMimeType: "application/json" }
                  : undefined,
              }),
            },
          );

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            return Response.json(
              { error: "Gemini request failed. Please try again later." },
              { status: response.status === 429 ? 429 : 502 },
            );
          }

          const text = data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? "")
            .join("");

          if (!text) {
            return Response.json(
              { error: "Gemini returned an empty response." },
              { status: 502 },
            );
          }

          return Response.json({ text });
        } catch {
          return Response.json(
            { error: "Unable to process the AI request." },
            { status: 500 },
          );
        }
      },
    },
  },
});
