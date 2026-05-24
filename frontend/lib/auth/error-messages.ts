const ERROR_PATTERNS: Array<{ match: RegExp | string; message: string }> = [
  {
    match: /unsupported provider|provider is not enabled/i,
    message:
      "Ese inicio de sesion social no esta habilitado en Supabase. Usa correo electronico o activa el proveedor en Authentication → Providers.",
  },
  {
    match: /invalid login credentials/i,
    message: "Correo o contrasena incorrectos.",
  },
  {
    match: /email not confirmed/i,
    message:
      "Confirma tu correo antes de iniciar sesion, o desactiva 'Confirm email' en Supabase → Authentication → Providers → Email.",
  },
  {
    match: /user already registered/i,
    message: "Ya existe una cuenta con ese correo. Prueba iniciar sesion.",
  },
  {
    match: /redirect_uri_mismatch/i,
    message:
      "La URL de redireccion no coincide. En Google/Apple/LinkedIn usa https://nnbpaxomgxlbcgirmfor.supabase.co/auth/v1/callback",
  },
]

export function formatAuthError(raw: string | null | undefined): string {
  if (!raw) return "No se pudo completar el inicio de sesion"

  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }

  if (decoded.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(decoded) as { msg?: string; message?: string }
      decoded = parsed.msg ?? parsed.message ?? decoded
    } catch {
      /* keep decoded */
    }
  }

  for (const { match, message } of ERROR_PATTERNS) {
    if (typeof match === "string" ? decoded.includes(match) : match.test(decoded)) {
      return message
    }
  }

  return decoded
}
