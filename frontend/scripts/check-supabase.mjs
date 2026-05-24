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
  console.error("\n❌ Credenciales PLACEHOLDER — el login NO funcionará")
  console.log("\n📋 Pasos:")
  console.log("   1. https://supabase.com/dashboard → New project")
  console.log("   2. Settings → API → copia URL y anon key")
  console.log("   3. Pega en frontend/.env.local")
  console.log("   4. Authentication → URL Configuration:")
  console.log("      Site URL: http://localhost:3000")
  console.log("      Redirect: http://localhost:3000/auth/callback")
  console.log("   5. npm run dev (reinicia el servidor)\n")
  process.exit(1)
}

try {
  const health = await fetch(`${url}/auth/v1/health`)
  if (health.ok) {
    console.log("✅ Supabase responde correctamente")
    console.log("\n   Siguiente: habilita Google/Apple/LinkedIn en Authentication → Providers\n")
  } else {
    console.error(`❌ Supabase respondió HTTP ${health.status}`)
    process.exit(1)
  }
} catch (e) {
  console.error(`❌ No se pudo conectar: ${e.message}`)
  process.exit(1)
}
