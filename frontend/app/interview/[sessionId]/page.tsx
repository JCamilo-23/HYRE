"use client"

import { use } from "react"
import { InterviewRoom } from "@/modules/ai-interview/components/InterviewRoom"

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  return <InterviewRoom sessionId={sessionId} role="candidate" />
}
