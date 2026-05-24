#!/usr/bin/env node
/**
 * Verifica credenciales Supabase en frontend/.env.local
 * Uso: node scripts/check-supabase.mjs
 */
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../.env.local")

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("❌ No existe frontend/.env.local")
    console.log("   Copia: cp .env.local.example .env.local")
    process.exit(1)
  }
  const vars = {}
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) vars[m[1]] = m[2].trim()
  }
  return vars
}

const env = loadEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n🔍 Verificación Supabase HYRE\n")

if (!url || !key) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY")
  process.exit(1)
}

const host = new URL(url).hostname
console.log(`   URL: ${url}`)

if (host.includes("placeholder") || host === "your-project.supabase.co") {
  console.error("\n❌ URL placeholder — actualiza NEXT_PUBLIC_SUPABASE_URL")
  process.exit(1)
}

if (key.includes("PASTE") || key.includes("placeholder") || key.includes("your-anon")) {
  console.error("\n❌ Falta la anon public key")
  console.log(`\n   Obténla en: https://supabase.com/dashboard/project/${host.replace(".supabase.co", "")}/settings/api`)
  console.log("   Pega en frontend/.env.local → NEXT_PUBLIC_SUPABASE_ANON_KEY\n")
  process.exit(1)
}

try {
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
  })
  if (!res.ok) {
    console.error(`❌ Supabase respondió HTTP ${res.status} — revisa la API key`)
    process.exit(1)
  }

  const settings = await res.json()
  const external = settings.external ?? {}
  const oauth = ["google", "apple", "linkedin_oidc"].filter((p) => external[p])
  const email = external.email === true

  console.log("✅ Supabase responde correctamente")
  console.log(`   Email auth: ${email ? "habilitado" : "deshabilitado"}`)
  console.log(`   OAuth: ${oauth.length ? oauth.join(", ") : "ninguno (habilita en Dashboard → Authentication → Providers)"}`)
  if (settings.mailer_autoconfirm === false) {
    console.log("   ⚠ Confirmación de email activa — desactívala en Providers → Email para pruebas rápidas")
  }
  console.log("")
} catch (e) {
  console.error(`❌ No se pudo conectar: ${e.message}`)
  process.exit(1)
}
