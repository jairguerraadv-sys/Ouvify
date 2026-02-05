#!/bin/bash
###############################################################################
# AUDIT PERFORMANCE - Ouvify
# Smoke tests e medições básicas de performance
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_ROOT="/workspaces/Ouvify"
EVIDENCE_DIR="$WORKSPACE_ROOT/audit/evidence"
OUTPUT_FILE="$EVIDENCE_DIR/performance.log"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   ⚡ Performance Audit - Speed & Optimization${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

mkdir -p "$EVIDENCE_DIR"

{
    echo "OUVIFY PERFORMANCE AUDIT REPORT"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    # 1. Backend Query Optimization Check
    echo "1. BACKEND QUERY OPTIMIZATION"
    echo "----------------------------------------"
    cd "$WORKSPACE_ROOT/apps/backend"
    echo "Checking for select_related usage (prevents N+1)..."
    grep -r "select_related\|prefetch_related" apps/ --include="*.py" | wc -l
    echo ""
    echo "Sample optimizations found:"
    grep -r "select_related\|prefetch_related" apps/ --include="*.py" | head -5 || echo "None"
    echo ""
    
    echo "Checking for potential N+1 patterns..."
    echo "Views without select_related (sample):"
    grep -l "\.objects\.all()\|\.objects\.filter(" apps/*/views.py 2>/dev/null | head -5 || echo "None"
    echo ""
    
    # 2. Database Indexes
    echo "2. DATABASE INDEXES"
    echo "----------------------------------------"
    echo "Checking for index definitions in models..."
    grep -r "db_index=True\|class Meta:" apps/ --include="models.py" -A 3 | grep -E "indexes|db_index" | head -10 || echo "No explicit indexes found"
    echo ""
    
    # 3. Caching Strategy
    echo "3. CACHING CONFIGURATION"
    echo "----------------------------------------"
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/settings.py" ]; then
        echo "Checking cache configuration..."
        grep -A 10 "CACHES = {" "$WORKSPACE_ROOT/apps/backend/config/settings.py" || echo "Cache config not found"
    fi
    echo ""
    echo "Cache usage in code:"
    grep -r "cache\." apps/backend/apps --include="*.py" | head -10 || echo "No cache usage found"
    echo ""
    
    # 4. Pagination Check
    echo "4. PAGINATION"
    echo "----------------------------------------"
    echo "Checking for pagination in list views..."
    grep -r "pagination_class\|PageNumberPagination" apps/backend/apps --include="*.py" | head -10 || echo "No pagination found"
    echo ""
    
    # 5. Frontend Bundle Size
    echo "5. FRONTEND BUNDLE SIZE"
    echo "----------------------------------------"
    if [ -d "$WORKSPACE_ROOT/apps/frontend/.next" ]; then
        cd "$WORKSPACE_ROOT/apps/frontend"
        echo "Build directory size:"
        du -sh .next/ 2>/dev/null || echo "Not available"
        echo ""
        echo "Largest static files:"
        find .next/static -type f -exec ls -lh {} \; 2>/dev/null | \
            awk '{print $5 "\t" $9}' | sort -rh | head -10 || echo "Build not available"
    else
        echo "⚠️  Frontend not built. Run: cd apps/frontend && npm run build"
    fi
    echo ""
    
    # 6. Image Optimization
    echo "6. IMAGE OPTIMIZATION"
    echo "----------------------------------------"
    echo "Checking for next/image usage (optimized images)..."
    cd "$WORKSPACE_ROOT/apps/frontend"
    grep -r "next/image\|Image from" app/ components/ --include="*.tsx" --include="*.jsx" | wc -l || echo "0"
    echo ""
    echo "Raw image tags (not optimized):"
    grep -r "<img " app/ components/ --include="*.tsx" --include="*.jsx" | wc -l || echo "0"
    echo ""
    
    # 7. Lazy Loading
    echo "7. LAZY LOADING"
    echo "----------------------------------------"
    echo "Checking for dynamic imports (code splitting)..."
    grep -r "dynamic\|lazy" "$WORKSPACE_ROOT/apps/frontend" --include="*.tsx" --include="*.ts" | head -10 || echo "None found"
    echo ""
    
    # 8. API Response Time (if backend is running)
    echo "8. API RESPONSE TIME (LOCAL)"
    echo "----------------------------------------"
    echo "Note: Backend must be running for this test"
    
    # Check if backend is running on port 8000
    if curl -s http://localhost:8000/health &>/dev/null; then
        echo "✅ Backend is running, testing endpoints..."
        
        # Create curl format file
        cat > /tmp/curl-format.txt << 'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
----------\n
time_total:  %{time_total}\n
EOF
        
        echo ""
        echo "Health endpoint timing:"
        curl -w "@/tmp/curl-format.txt" -o /dev/null -s http://localhost:8000/health
        
    else
        echo "⚠️  Backend not running on localhost:8000"
        echo "To test: cd apps/backend && python manage.py runserver"
    fi
    echo ""
    
    # 9. Static Files
    echo "9. STATIC FILES OPTIMIZATION"
    echo "----------------------------------------"
    echo "Checking for static file compression..."
    if [ -f "$WORKSPACE_ROOT/apps/backend/config/settings.py" ]; then
        grep -i "gzip\|compression" "$WORKSPACE_ROOT/apps/backend/config/settings.py" || echo "No compression config found"
    fi
    echo ""
    
    # 10. Database Connection Pooling
    echo "10. DATABASE CONNECTION POOLING"
    echo "----------------------------------------"
    echo "Checking for connection pool configuration..."
    grep -r "CONN_MAX_AGE\|conn_max_age" "$WORKSPACE_ROOT/apps/backend/config" || echo "No connection pooling found"
    echo ""
    
    # 11. Async/Celery Tasks
    echo "11. ASYNC TASK OPTIMIZATION"
    echo "----------------------------------------"
    echo "Checking for Celery task definitions..."
    grep -r "@shared_task\|@task" "$WORKSPACE_ROOT/apps/backend/apps" --include="*.py" | wc -l || echo "0"
    echo ""
    echo "Sample async tasks:"
    grep -r "@shared_task\|@task" "$WORKSPACE_ROOT/apps/backend/apps" --include="*.py" -A 1 | head -10 || echo "None"
    echo ""
    
    # 12. Frontend Loading States
    echo "12. LOADING STATES (UX)"
    echo "----------------------------------------"
    echo "Checking for loading indicators..."
    grep -r "loading\|isLoading\|Loading" "$WORKSPACE_ROOT/apps/frontend/components" --include="*.tsx" | wc -l || echo "0"
    echo ""
    
    echo "========================================"
    echo "Performance audit completed: $(date)"
    echo ""
    echo "RECOMMENDATIONS:"
    echo "1. Ensure select_related() used on all foreign key queries"
    echo "2. Add database indexes on frequently queried fields"
    echo "3. Implement Redis caching for expensive queries"
    echo "4. Add pagination to all list endpoints"
    echo "5. Use next/image for all images (automatic optimization)"
    echo "6. Implement code splitting with dynamic imports"
    echo "7. Configure connection pooling (CONN_MAX_AGE)"
    echo "8. Move heavy tasks to Celery background jobs"
    
} | tee "$OUTPUT_FILE"

echo ""
echo -e "${GREEN}✅ Performance audit complete!${NC}"
echo -e "${YELLOW}📄 Report saved: $OUTPUT_FILE${NC}"
echo ""
