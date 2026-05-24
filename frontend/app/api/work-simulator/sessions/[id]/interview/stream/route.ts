import { subscribeInterviewEvents, type InterviewEventPayload } from "@/lib/interview-event-bus"
import { getSession } from "@/lib/work-simulator-session-store"

type Params = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  const session = getSession(id)

  if (!session) {
    return new Response("Sesión no encontrada", { status: 404 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: InterviewEventPayload) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      send({ type: "connected" })

      const unsubscribe = subscribeInterviewEvents(id, send)

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"))
      }, 15000)

      const close = () => {
        clearInterval(heartbeat)
        unsubscribe()
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      }

      request.signal.addEventListener("abort", close)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
