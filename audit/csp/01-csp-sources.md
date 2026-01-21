# CSP Sources Audit - Phase A
**Date:** January 20, 2026
**Status:** ✅ Completed

## Frontend CSP Sources

### 1. Next.js Middleware (`middleware.ts`)
**Location:** `/Users/jairneto/Desktop/ouvy_saas/ouvy_frontend/middleware.ts`
**Lines:** 64, 77
**Method:** `response.headers.set('Content-Security-Policy', cspHeader)`

**Environment-specific policies:**
- **Development:** Relaxed policy with `'unsafe-inline'` for hot reload
- **Production:** Strict policy with `'nonce-${nonce}'` and `'strict-dynamic'`

**Routes affected:** All routes (`/(.*)`)

### 2. Next.js Config (`next.config.ts`)
**Location:** `/Users/jairneto/Desktop/ouvy_saas/ouvy_frontend/next.config.ts`
**Status:** ❌ No CSP headers defined
**Method:** Uses `async headers()` but only for basic security headers (X-Frame-Options, etc.)

### 3. Vercel Config (`vercel.json`)
**Location:** `/Users/jairneto/Desktop/ouvy_saas/ouvy_frontend/vercel.json`
**Status:** ❌ No CSP headers defined
**Method:** Uses `headers` array but only for basic security headers

## Backend CSP Sources

### 1. Django Settings (`settings.py`)
**Location:** `/Users/jairneto/Desktop/ouvy_saas/ouvy_saas/config/settings.py`
**Lines:** 75-87
**Method:** Django settings variables (CSP_DEFAULT_SRC, CSP_SCRIPT_SRC, etc.)

**Configuration:**
```python
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "NONCE", "https://js.stripe.com", "'strict-dynamic'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")  # Tailwind necessita unsafe-inline
CSP_IMG_SRC = ("'self'", "data:", "https:", "blob:")
CSP_FONT_SRC = ("'self'", "data:")
CSP_CONNECT_SRC = ("'self'", "https://api.stripe.com")
CSP_FRAME_SRC = ("https://js.stripe.com", "https://hooks.stripe.com")
CSP_OBJECT_SRC = ("'none'",)
CSP_BASE_URI = ("'self'",)
CSP_FORM_ACTION = ("'self'",)
```

### 2. Django Middleware (`security_middleware.py`)
**Location:** `/Users/jairneto/Desktop/ouvy_saas/ouvy_saas/apps/core/security_middleware.py`
**Line:** 52
**Method:** `response['Content-Security-Policy'] = '; '.join(csp_parts)`

**Features:**
- Generates cryptographically secure nonces using `secrets.token_urlsafe(16)`
- Substitutes `NONCE` placeholder with actual nonce value
- Only applies in production (`DEBUG=False`)

## External Scripts Identified

### 1. Stripe Scripts
- **Source:** `https://js.stripe.com`
- **Purpose:** Payment processing
- **CSP Impact:** Must be allowed in `script-src` and `frame-src`

### 2. Next.js Script Components
- **Component:** `StructuredData.tsx`
- **Method:** Uses Next.js `<Script>` component (automatically nonce-compatible)
- **Purpose:** JSON-LD structured data

## Routes and Environments

### Frontend Routes Affected
- **All routes:** `/(.*)` - CSP applied via middleware
- **Environment:** Both development and production (different policies)

### Backend Routes Affected
- **All routes:** Applied via Django middleware
- **Environment:** Production only (`DEBUG=False`)

## Summary
- **Primary CSP Source (Frontend):** Next.js middleware.ts
- **Primary CSP Source (Backend):** Django settings.py + security_middleware.py
- **External Dependencies:** Stripe (js.stripe.com)
- **Risk:** Potential conflicts between frontend and backend CSP headers</content>
<parameter name="filePath">/Users/jairneto/Desktop/ouvy_saas/audit/csp/01-csp-sources.md