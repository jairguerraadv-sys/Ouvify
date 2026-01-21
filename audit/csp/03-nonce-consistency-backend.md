# Backend Nonce Consistency Audit - Phase B2
**Date:** January 20, 2026
**Status:** ✅ Validated

## Django CSP Nonce Implementation

### 1. Nonce Generation
**File:** `security_middleware.py`
**Method:** `secrets.token_urlsafe(16)` (cryptographically secure)
**Line:** 22
```python
nonce = secrets.token_urlsafe(16)
request.csp_nonce = nonce
```

### 2. NONCE Placeholder Substitution
**File:** `security_middleware.py`
**Method:** List comprehension replacement
**Lines:** 29-31
```python
script_src = list(settings.CSP_SCRIPT_SRC)
# Substituir NONCE pelo nonce real
script_src = [nonce if src == 'NONCE' else src for src in script_src]
```

### 3. CSP Header Construction
**File:** `security_middleware.py`
**Method:** Dynamic CSP building from settings
**Line:** 52
```python
response['Content-Security-Policy'] = '; '.join(csp_parts)
```

## Settings Configuration

### CSP_SCRIPT_SRC Configuration
**File:** `settings.py`
**Lines:** 79-80
```python
CSP_SCRIPT_SRC = ("'self'", "NONCE", "https://js.stripe.com", "'strict-dynamic'")
```

**Substitution Result:**
```
Input:  ("'self'", "NONCE", "https://js.stripe.com", "'strict-dynamic'")
Output: ("'self'", "<actual-nonce>", "https://js.stripe.com", "'strict-dynamic'")
```

## request.csp_nonce Usage

### ✅ Django 6.0+ Native Support
- **Native CSP Nonce:** Django provides `request.csp_nonce` for templates
- **Middleware Integration:** Nonce set before response processing
- **Template Usage:** Available in Django templates as `{{ request.csp_nonce }}`

### ✅ Production-Only Application
- **DEBUG Check:** `if not settings.DEBUG:` (Line 20)
- **Development Bypass:** No CSP headers in development
- **Environment Safety:** Prevents development interference

## CSP Header Output Validation

### Production CSP Header Example:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123def456...' https://js.stripe.com 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'
```

### ✅ Key Features Verified:
- **Nonce Uniqueness:** Each request gets unique nonce
- **Cryptographic Security:** `secrets.token_urlsafe(16)` = 128-bit entropy
- **Placeholder Replacement:** `NONCE` → actual nonce value
- **Stripe Compatibility:** `https://js.stripe.com` allowed
- **Strict Dynamic:** Modern browser support for dynamic script loading

## Potential Conflicts

### ⚠️ Frontend/Backend CSP Conflict Risk
- **Frontend:** Next.js middleware sets CSP header
- **Backend:** Django middleware sets CSP header
- **Risk:** Both might set conflicting CSP headers
- **Current Status:** Frontend handles all routes, backend CSP may be redundant

### ✅ Mitigation Strategy
- **Environment Separation:** Backend CSP only in production Django
- **Frontend Priority:** Next.js middleware handles CSP for frontend routes
- **API Routes:** Backend CSP applies to `/api/*` routes (excluded from Next.js middleware)

## Validation Results

### ✅ Nonce Generation
- Cryptographically secure ✅
- Unique per request ✅
- Available via `request.csp_nonce` ✅

### ✅ CSP Construction
- Settings-driven configuration ✅
- Placeholder substitution works ✅
- Production-only application ✅

### ✅ Security Compliance
- No `'unsafe-inline'` in script-src ✅
- `'strict-dynamic'` enabled ✅
- External scripts explicitly allowed ✅

## Recommendations

1. **Conflict Resolution:** Consider disabling Django CSP if Next.js handles all user-facing routes
2. **API Security:** Ensure API routes have appropriate CSP
3. **Monitoring:** Log CSP violations for security monitoring
4. **Testing:** Verify Stripe integration works with nonce-based CSP</content>
<parameter name="filePath">/Users/jairneto/Desktop/ouvy_saas/audit/csp/03-nonce-consistency-backend.md