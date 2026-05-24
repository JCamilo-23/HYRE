import { NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_KEY = process.env.ASSEMBLYAI_API_KEY ?? ""

export async function POST(request: NextRequest) {
  const { audio, mimeType } = await request.json()

  if (!ASSEMBLYAI_KEY || !audio) {
    return NextResponse.json({ text: "" }, { status: 400 })
  }

  // Decode base64 → binary
  const binary = Buffer.from(audio as string, "base64")

  // 1. Upload audio to AssemblyAI
  const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_KEY,
      "content-type": (mimeType as string) || "audio/webm",
    },
    body: binary,
  })

  if (!uploadRes.ok) {
    console.warn("AssemblyAI upload error:", await uploadRes.text())
    return NextResponse.json({ text: "" }, { status: 500 })
  }

  const { upload_url } = (await uploadRes.json()) as { upload_url: string }

  // 2. Request transcription (Spanish, no speaker labels for speed)
  const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_code: "es",
      punctuate: false,
      format_text: false,
    }),
  })

  if (!transcriptRes.ok) {
    console.warn("AssemblyAI transcript error:", await transcriptRes.text())
    return NextResponse.json({ text: "" }, { status: 500 })
  }

  const { id } = (await transcriptRes.json()) as { id: string }

  // 3. Poll until completed (max 15s)
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: ASSEMBLYAI_KEY },
    })
    const data = (await pollRes.json()) as { status: string; text?: string; error?: string }
    if (data.status === "completed") {
      return NextResponse.json({ text: data.text ?? "" })
    }
    if (data.status === "error") {
      console.warn("AssemblyAI transcription error:", data.error)
      return NextResponse.json({ text: "" })
    }
  }

  return NextResponse.json({ text: "" })
}
