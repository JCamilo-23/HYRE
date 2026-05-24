"use client"

import { use } from "react"
import dynamic from "next/dynamic"

const InterviewRoom = dynamic(
  () =>
    import("@/modules/ai-interview/components/InterviewRoom").then(
      (m) => m.InterviewRoom,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0614] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
        <p className="mt-4 text-sm text-[#94A3B8]">Cargando sala de entrevista…</p>
      </div>
    ),
  },
)

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  return <InterviewRoom sessionId={sessionId} role="candidate" />
}
