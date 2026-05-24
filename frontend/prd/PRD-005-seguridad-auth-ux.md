# PRD-005: Seguridad de autenticación y UX del flujo de registro

**Rama sugerida:** `feature/prd005-auth-security-ux`  
**Prioridad:** ALTA  
**Objetivo:** Elevar la seguridad real de las cuentas de usuario y mejorar la experiencia del flujo de registro/login, sin agregar fricción innecesaria.

---

## Problema actual

| # | Problema | Archivo afectado |
|---|---|---|
| 1 | La validación de contraseña solo exige 8 caracteres — sin mayúsculas, números ni caracteres especiales | `components/skillmatch/register-screen.tsx:42-43` |
| 2 | No hay indicador visual de fortaleza de contraseña — el usuario no sabe qué tan segura es | `register-screen.tsx` |
| 3 | El campo "Confirmar contraseña" no tiene toggle de mostrar/ocultar — inconsistente con el primer campo | `register-screen.tsx:276-286` |
| 4 | Los errores de validación solo aparecen al hacer submit — no hay feedback en tiempo real | `register-screen.tsx:31-54` |
| 5 | El texto del formulario tiene errores de tildes y eñes ("Contrasena", "Ingresa tu correo valido") | `register-screen.tsx` múltiples líneas |
| 6 | No hay indicador de qué requisitos faltan mientras el usuario escribe | `register-screen.tsx` |
| 7 | No hay protección contra doble submit (botón no se bloquea visualmente antes del `isLoading`) | `register-screen.tsx:327-347` |

---

## Solución propuesta

### 1. Validación de contraseña con reglas explícitas

**Reglas mínimas requeridas:**

| Requisito | Regex / condición |
|---|---|
| Mínimo 10 caracteres | `length >= 10` |
| Al menos 1 mayúscula | `/[A-Z]/` |
| Al menos 1 minúscula | `/[a-z]/` |
| Al menos 1 número | `/[0-9]/` |
| Al menos 1 carácter especial | `/[!@#$%^&*(),.?":{}|<>_\-]/` |

**Niveles de fortaleza:**

| Nivel | Condición | Color |
|---|---|---|
| Débil | 1-2 reglas cumplidas | `#EF4444` (rojo) |
| Media | 3-4 reglas cumplidas | `#F59E0B` (amarillo) |
| Fuerte | 5 reglas cumplidas | `#10B981` (verde) |

---

### 2. Componente `PasswordStrengthIndicator`

**Ubicación:** `components/ui/password-strength-indicator.tsx`

```
┌─────────────────────────────────────────┐
│ ●●●●○  Contraseña media                 │
│                                         │
│ ✅ Mínimo 10 caracteres                 │
│ ✅ Mayúscula (A-Z)                      │
│ ✅ Minúscula (a-z)                      │
│ ✅ Número (0-9)                         │
│ ❌ Carácter especial (!@#...)           │
└─────────────────────────────────────────┘
```

- Barra de progreso animada (4 segmentos, colores progresivos)
- Lista de requisitos con ✅/❌ en tiempo real
- Solo se muestra cuando el campo contraseña tiene foco o tiene contenido
- Animación suave con `framer-motion` (ya disponible en el proyecto)

---

### 3. Validación en tiempo real (on-change)

Actualmente la validación corre solo en submit. Cambiar a:
- **Contraseña:** validar mientras escribe, mostrar `PasswordStrengthIndicator`
- **Confirmar contraseña:** mostrar error solo si el campo ha perdido foco (`onBlur`) Y tiene contenido — no interrumpir mientras escribe
- **Email:** validar formato solo al perder foco (`onBlur`)
- **Nombre:** validar solo en submit (no molestar al usuario mientras escribe)

---

### 4. Toggle mostrar/ocultar en ambos campos de contraseña

El campo "Confirmar contraseña" debe tener su propio toggle independiente del campo "Contraseña". Agregar estado `showConfirmPassword` separado.

---

### 5. Corrección de textos (i18n mínimo)

Corregir en `register-screen.tsx`:

| Texto actual | Texto correcto |
|---|---|
| "Contrasena" | "Contraseña" |
| "Minimo 8 caracteres" | "Mínimo 10 caracteres" |
| "Las contrasenas no coinciden" | "Las contraseñas no coinciden" |
| "Repite tu contrasena" | "Repite tu contraseña" |
| "Debes aceptar los terminos" | "Debes aceptar los términos" |
| "Ingresa un correo valido" | "Ingresa un correo válido" |
| "Correo electronico" | "Correo electrónico" |

---

### 6. UX adicional

- **Autocompletado semántico:** agregar `autoComplete="new-password"` al campo contraseña de registro y `autoComplete="current-password"` en login — mejora UX con gestores de contraseñas
- **Enter para submit:** el formulario debe responder a `onKeyDown` Enter en cualquier campo
- **Botón deshabilitado visualmente** mientras `isLoading` es true (ya existe la prop pero el estilo no cambia opacity)
- **Mensaje de éxito de verificación de email:** si Supabase requiere confirmación de correo, mostrar pantalla de "Revisa tu bandeja de entrada" en lugar de pantalla en blanco

---

## Arquitectura de implementación

### Archivos a crear

```
frontend/components/ui/password-strength-indicator.tsx   ← Componente nuevo
```

### Archivos a modificar

```
frontend/components/skillmatch/register-screen.tsx       ← Validación + UX
```

### Función de validación (puede ir en `lib/utils.ts`)

```typescript
export type PasswordRule = {
  label: string
  test: (pw: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "Mínimo 10 caracteres",      test: (pw) => pw.length >= 10 },
  { label: "Mayúscula (A-Z)",           test: (pw) => /[A-Z]/.test(pw) },
  { label: "Minúscula (a-z)",           test: (pw) => /[a-z]/.test(pw) },
  { label: "Número (0-9)",             test: (pw) => /[0-9]/.test(pw) },
  { label: "Carácter especial (!@#…)", test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(pw) },
]

export function getPasswordStrength(pw: string): "weak" | "medium" | "strong" {
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length
  if (passed <= 2) return "weak"
  if (passed <= 4) return "medium"
  return "strong"
}

export function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw))
}
```

---

## Criterios de aceptación

- [ ] Contraseña rechazada si falta cualquiera de los 5 requisitos
- [ ] `PasswordStrengthIndicator` visible mientras el usuario escribe la contraseña
- [ ] Cada requisito muestra ✅ en tiempo real al cumplirse
- [ ] Errores de confirmación de contraseña solo aparecen al perder foco del campo
- [ ] Ambos campos de contraseña tienen toggle mostrar/ocultar independientes
- [ ] Textos con tildes y eñes correctas en toda la pantalla
- [ ] Formulario responde a Enter
- [ ] Botón "Crear cuenta" muestra estado deshabilitado visualmente durante submit
- [ ] Si Supabase devuelve "email not confirmed", mostrar pantalla de verificación

---

## Métricas de éxito

| Métrica | Baseline actual | Meta |
|---|---|---|
| % de contraseñas débiles (solo letras/números simples) | ~60% estimado | < 5% |
| Tasa de abandono del formulario de registro | Por medir | -10% |
| Errores de "contraseñas no coinciden" al submit | Frecuente | Eliminado con validación on-blur |

---

## Fuera de alcance (este PRD)

- Autenticación de dos factores (2FA) — PRD separado
- Recuperación de contraseña — flujo existe en Supabase, UI pendiente
- Rate limiting en intentos de login — se implementa a nivel backend/Supabase
- Verificación de correo ya registrado antes del submit (requiere endpoint separado)
