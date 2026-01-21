# Report-Only Mode Implementation - Phase D
**Date:** January 20, 2026
**Status:** 📋 Planned

## Report-Only Strategy

### Environment Detection
- **Staging Environment:** `NODE_ENV=staging` or custom environment variable
- **Duration:** 48 hours post-deployment
- **Purpose:** Monitor CSP violations without blocking functionality

### Report-Only Header Implementation

#### Frontend (Next.js Middleware)
```typescript
// Add to middleware.ts
const isStaging = process.env.NODE_ENV === 'staging';

if (isStaging) {
  // Report-only header alongside blocking header
  response.headers.set('Content-Security-Policy-Report-Only', cspHeader + '; report-uri /api/csp-report');
} else if (!isDevelopment) {
  // Production: blocking header only
  response.headers.set('Content-Security-Policy', cspHeader);
}
```

#### Backend (Django)
```python
# Add to security_middleware.py
if settings.ENVIRONMENT == 'staging':
    response['Content-Security-Policy-Report-Only'] = csp_header + '; report-uri /api/csp-report'
elif not settings.DEBUG:
    response['Content-Security-Policy'] = csp_header
```

### Report Collection Endpoint

#### API Route: `/api/csp-report`
```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    
    // Log CSP violation (don't store sensitive data)
    console.error('CSP Violation:', {
      timestamp: new Date().toISOString(),
      'csp-report': {
        'document-uri': report['csp-report']['document-uri'],
        'violated-directive': report['csp-report']['violated-directive'],
        'original-policy': report['csp-report']['original-policy'],
        // Exclude blocked-uri and source-file to avoid sensitive data
      }
    });
    
    // TODO: Send to monitoring service (Sentry, etc.)
    
    return NextResponse.json({ status: 'reported' });
  } catch (error) {
    console.error('CSP Report processing error:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}
```

### Report Data Structure
```json
{
  "csp-report": {
    "document-uri": "https://ouvy.com/dashboard",
    "referrer": "https://ouvy.com/",
    "violated-directive": "script-src-elem",
    "effective-directive": "script-src-elem",
    "original-policy": "script-src 'self' 'nonce-abc123' 'strict-dynamic' https://js.stripe.com",
    "blocked-uri": "https://evil.com/malicious.js",
    "status-code": 200
  }
}
```

## Implementation Plan

### Phase 1: Environment Setup
1. Add `NODE_ENV=staging` support to Vercel deployment
2. Update Railway environment variables for staging
3. Configure staging domains for testing

### Phase 2: Report-Only Headers
1. Update `middleware.ts` with report-only logic
2. Update `security_middleware.py` with report-only logic
3. Test header application in staging

### Phase 3: Report Collection
1. Create `/api/csp-report` endpoint
2. Implement secure logging (no sensitive data)
3. Set up monitoring integration

### Phase 4: 48-Hour Monitoring
1. Deploy to staging with report-only
2. Monitor logs for violations
3. Adjust policies based on findings
4. Switch to blocking mode after validation

## Security Considerations

### ✅ Safe Logging
- **Exclude Sensitive Data:** Don't log `blocked-uri` or `source-file`
- **Anonymize URIs:** Remove query parameters and fragments
- **Rate Limiting:** Prevent report spam attacks

### ✅ Monitoring Integration
- **Sentry:** Send CSP violations as errors
- **Custom Dashboard:** Aggregate violation patterns
- **Alerting:** Notify on critical violations

## Rollback Plan

### Quick Rollback Commands
```bash
# Disable CSP entirely (emergency)
export CSP_DISABLED=true

# Switch back to report-only
export CSP_REPORT_ONLY=true

# Revert to allowlist approach
export CSP_STRICT_MODE=false
```

### Gradual Rollback
1. **Level 1:** Add `'unsafe-inline'` back to script-src
2. **Level 2:** Disable `'strict-dynamic'`
3. **Level 3:** Allow all HTTPS origins
4. **Level 4:** Disable CSP entirely

## Success Criteria

### ✅ Report-Only Phase Complete When:
- [ ] No blocking CSP violations in staging
- [ ] Stripe payments work correctly
- [ ] All user journeys functional
- [ ] Report collection working
- [ ] Monitoring alerts configured

### ✅ Production Deployment Ready When:
- [ ] 48-hour staging test passed
- [ ] Rollback procedures documented
- [ ] Incident response plan updated
- [ ] Team trained on CSP monitoring</content>
<parameter name="filePath">/Users/jairneto/Desktop/ouvy_saas/audit/csp/05-report-only-plan.md