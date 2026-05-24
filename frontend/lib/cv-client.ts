/**
 * Comprime imagenes grandes antes de subirlas al analizador de CV.
 * Reduce timeouts y errores de "failed to fetch" en conexiones lentas.
 */
export async function prepareCvFileForUpload(file: File): Promise<File> {
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name)
  if (!isImage || file.size <= 900_000) return file

  try {
    const bitmap = await createImageBitmap(file)
    const maxSide = 1600
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    })

    if (!blob) return file

    const compressed = new File(
      [blob],
      file.name.replace(/\.(png|webp)$/i, ".jpg"),
      { type: "image/jpeg" },
    )

    return compressed.size < file.size ? compressed : file
  } catch {
    return file
  }
}

export async function analyzeCvFile(
  file: File,
  options?: { timeoutMs?: number },
): Promise<{
  analysis: import("@/lib/hyre-types").CvAnalysis
  extractedText?: string
  source?: "vision" | "document" | "text"
}> {
  const prepared = await prepareCvFileForUpload(file)
  const formData = new FormData()
  formData.append("file", prepared)

  const controller = new AbortController()
  const timeoutMs = options?.timeoutMs ?? 120_000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch("/api/cv/analyze", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    let data: {
      analysis?: import("@/lib/hyre-types").CvAnalysis
      extractedText?: string
      source?: "vision" | "document" | "text"
      error?: string
    } = {}

    try {
      data = await res.json()
    } catch {
      throw new Error("El servidor no respondio correctamente. Intenta de nuevo.")
    }

    if (!res.ok) {
      throw new Error(data.error ?? `Error del servidor (${res.status})`)
    }

    if (!data.analysis) {
      throw new Error("La IA no devolvio un analisis valido.")
    }

    return {
      analysis: data.analysis,
      extractedText: data.extractedText,
      source: data.source,
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("El analisis tardo demasiado. Prueba con una imagen mas pequena o mejor conexion.")
      }
      if (err.message === "Failed to fetch") {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica tu conexion o que la app este desplegada con GEMINI_API_KEY.",
        )
      }
      throw err
    }
    throw new Error("Error inesperado al analizar el CV.")
  } finally {
    clearTimeout(timeoutId)
  }
}
