import { NextRequest, NextResponse } from "next/server"
import { getGeminiApiKey, getGeminiModels } from "@/lib/gemini-server"

export async function POST(request: NextRequest) {
  const { audio, mimeType } = await request.json()

  const apiKey = getGeminiApiKey()
  if (!apiKey || !audio) {
    return NextResponse.json({ text: "" }, { status: 400 })
  }

  const safeMime = (mimeType as string | undefined)?.startsWith("audio/") ? mimeType : "audio/webm"

  for (const model of getGeminiModels()) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: safeMime, data: audio } },
                  {
                    text: "Transcribe exactly what is said in this audio clip. The speaker is answering job interview questions in Spanish. Return ONLY the spoken words, no commentary, no punctuation corrections. If the audio is silent or contains no speech, return an empty string.",
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0, maxOutputTokens: 512 },
          }),
        },
      )

      if (!res.ok) continue

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[]
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
      return NextResponse.json({ text })
    } catch {
      continue
    }
  }

  return NextResponse.json({ text: "" })
}
