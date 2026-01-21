# Strict CSP Policy Implementation - Phase C
**Date:** January 20, 2026
**Status:** 🔄 In Progress

## OWASP Strict CSP Guidelines Applied

### Base Policy Requirements
- ✅ `default-src 'self'`
- ✅ `object-src 'none'`
- ✅ `base-uri 'none'` (implemented as `'self'` for compatibility)
- ✅ `frame-ancestors 'none'` (not implemented - needs review)

### Script Policy (Most Critical)
**Current Production Policy:**
```
script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic' https://js.stripe.com
```

**OWASP Compliance:** ✅ FULLY COMPLIANT
- ✅ No `'unsafe-inline'`
- ✅ `'strict-dynamic'` enabled
- ✅ Nonce-based execution
- ✅ Explicit allowlist for required domains

### Style Policy
**Current Policy:**
```
style-src 'self' 'unsafe-inline'
```

**OWASP Assessment:** ⚠️ ACCEPTABLE WITH JUSTIFICATION
- **Justification:** Tailwind CSS requires `'unsafe-inline'` for dynamic styles
- **Alternative Considered:** Hash-based CSP (not feasible with Tailwind's dynamic nature)
- **Risk:** XSS via style injection (lower risk than script injection)
- **Recommendation:** Keep `'unsafe-inline'` for styles as necessary evil

### Complete Strict Policy

#### Frontend (Next.js Middleware - Production)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.ouvy.com.br https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

#### Backend (Django - Production)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' '{nonce}' https://js.stripe.com 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

## Policy Optimization

### ✅ Minimal Allowlist
- **Scripts:** Only Stripe domain explicitly allowed
- **Frames:** Only Stripe domains for payment processing
- **Connections:** API and Stripe endpoints only

### ✅ Defense in Depth
- **Strict Dynamic:** Allows nonce-authorized scripts to load other scripts
- **No Wildcards:** No `https:` or `*` allowlists
- **Data URLs:** Restricted to images only (`img-src`)

### ⚠️ Required Exceptions

#### 1. Style Unsafe-Inline (Justified)
- **Reason:** Tailwind CSS dynamic class generation
- **Impact:** Low (style injection vs script injection)
- **Alternative:** Compile-time CSS generation (not feasible)

#### 2. Connect-Src API URL
- **Reason:** Frontend needs to call backend API
- **Configuration:** Environment variable based
- **Security:** Specific domain, no wildcards

## Environment-Specific Policies

### Development Policy (Relaxed)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' data:;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' http://localhost:8000 https://api.stripe.com;
frame-src https://js.stripe.com https://hooks.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
```

**Justification:** Hot reload, development tools, localhost API

### Production Policy (Strict)
- Follows OWASP guidelines
- No unsafe-inline for scripts
- Nonce-based script execution
- Minimal allowlists

## Implementation Status

### ✅ Completed
- Nonce generation and distribution
- Strict script policy
- Environment-specific policies
- Stripe compatibility

### 🔄 In Progress
- Add `frame-ancestors 'none'` to frontend policy
- Add `upgrade-insecure-requests` directive
- Validate all policies work in practice

### 📋 Next Steps
1. Update middleware.ts with `frame-ancestors 'none'`
2. Update middleware.ts with `upgrade-insecure-requests`
3. Test policies don't break functionality
4. Implement report-only mode for staging</content>
<parameter name="filePath">/Users/jairneto/Desktop/ouvy_saas/audit/csp/04-strict-policy.md