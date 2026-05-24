export function getGeminiModels(): string[] {
  const primary = process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
  const pro = process.env.GEMINI_PRO_MODEL ?? "gemini-1.5-pro"
  return [...new Set([primary, pro, "gemini-1.5-flash"])]
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY
}

type GeminiContent = { role: string; parts: { text: string }[] }

async function geminiRequest(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    console.warn(`Gemini ${model}:`, await res.text())
    return null
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
}

export async function geminiGenerateText(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string | null> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return null

  for (const model of getGeminiModels()) {
    const text = await geminiRequest(apiKey, model, {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.75,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    })
    if (text) return text
  }
  return null
}

export async function geminiChat(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
): Promise<string | null> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return null

  const contents: GeminiContent[] = history
    .slice(0, -1)
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))

  contents.push({ role: "user", parts: [{ text: userMessage }] })

  for (const model of getGeminiModels()) {
    const text = await geminiRequest(apiKey, model, {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.75, maxOutputTokens: 2048 },
    })
    if (text) return text
  }
  return null
}

function stripJsonFences(raw: string): string {
  let text = raw.trim()
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  }
  return text.trim()
}

export async function geminiGenerateJson<T extends Record<string, unknown>>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T | null> {
  const raw = await geminiGenerateText(
    systemPrompt,
    `${userPrompt}\n\nResponde ÚNICAMENTE con JSON válido, sin markdown.`,
    { temperature: 0.5 },
  )
  if (!raw) return null
  try {
    return JSON.parse(stripJsonFences(raw)) as T
  } catch {
    return null
  }
}
