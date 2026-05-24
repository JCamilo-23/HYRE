# Supabase OAuth — Google, Apple y LinkedIn

Esta guía configura el inicio de sesión social en HYRE con Supabase Auth.

## 1. Variables de entorno (frontend)

Copia `frontend/.env.local.example` a `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## 2. URLs de redirección en Supabase

En **Supabase Dashboard → Authentication → URL Configuration**:

| Campo | Valor (local) |
|-------|----------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

En producción añade tu dominio, por ejemplo `https://hyre.app/auth/callback`.

## 3. Google (Gmail)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Crea **OAuth 2.0 Client ID** (tipo Web application)
3. **Authorized redirect URI** (obligatorio):
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```
4. Supabase → **Authentication → Providers → Google** → Enable
5. Pega **Client ID** y **Client Secret**

## 4. Apple

1. [Apple Developer](https://developer.apple.com/) → Certificates, Identifiers & Profiles
2. Crea un **Services ID** y configura Sign in with Apple
3. Return URL:
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```
4. Genera una **Key** para Sign in with Apple
5. Supabase → **Authentication → Providers → Apple** → Enable
6. Configura Services ID, Team ID, Key ID y private key

## 5. LinkedIn

Supabase usa **LinkedIn (OIDC)** con provider id `linkedin_oidc`.

1. [LinkedIn Developer Portal](https://www.linkedin.com/developers/) → Create app
2. En **Auth** → **OAuth 2.0 settings**:
   - Redirect URL:
     ```
     https://TU-PROYECTO.supabase.co/auth/v1/callback
     ```
   - Scopes: `openid`, `profile`, `email`
3. Supabase → **Authentication → Providers → LinkedIn (OIDC)** → Enable
4. Pega **Client ID** y **Client Secret**

## 6. Migraciones

Aplica la migración de perfiles OAuth:

```bash
cd frontend
npx supabase db push
# o en remoto:
npx supabase migration up
```

La migración `002_oauth_profiles.sql` guarda el rol (`candidate` / `recruiter`) desde los metadatos OAuth.

## 7. Flujo en la app

1. Usuario elige tipo (candidato / empresa) en `/app` o `/login`
2. Pulsa **Continuar con Google / Apple / LinkedIn**
3. Supabase redirige al proveedor → vuelve a `/auth/callback`
4. Se crea la sesión y el perfil en `profiles`
5. Redirección a `/app?auth=success` → Home

## 8. Desarrollo local con Supabase CLI

Si usas `supabase start`, define en `.env` del CLI:

```env
SUPABASE_AUTH_GOOGLE_CLIENT_ID=...
SUPABASE_AUTH_GOOGLE_SECRET=...
SUPABASE_AUTH_APPLE_CLIENT_ID=...
SUPABASE_AUTH_APPLE_SECRET=...
SUPABASE_AUTH_LINKEDIN_CLIENT_ID=...
SUPABASE_AUTH_LINKEDIN_SECRET=...
```

## Solución de problemas

| Error | Causa probable |
|-------|----------------|
| `redirect_uri_mismatch` | Redirect URL no coincide en Google/Apple/LinkedIn |
| `invalid flow state` | Callback URL no está en Supabase Redirect URLs |
| Perfil sin rol | Ejecutar migración `002_oauth_profiles.sql` |
| LinkedIn no aparece | Usar provider `linkedin_oidc`, no el legacy `linkedin` |
