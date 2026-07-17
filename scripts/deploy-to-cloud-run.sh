#!/bin/bash

# SuperApp MGrand Hub - Cloud Run Deployment Script
# This script automates the deployment of all microservices to Google Cloud Run

set -e  # Exit on error

# ==============================
# Configuration
# ==============================

PROJECT_ID="mgrand-hub-prod"
REGION="us-central1"
MIN_INSTANCES=0
MAX_INSTANCES=10
MEMORY="512Mi"
CPU=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================
# Functions
# ==============================

print_header() {
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ==============================
# Pre-flight Checks
# ==============================

print_header "Pre-flight Checks"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi
print_success "gcloud CLI found"

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_error "Not logged into gcloud. Run: gcloud auth login"
    exit 1
fi
print_success "Authenticated with gcloud"

# Set project
gcloud config set project $PROJECT_ID
print_success "Project set to $PROJECT_ID"

# ==============================
# Service Definitions
# ==============================

# Format: "service-name:port"
declare -a SERVICES=(
    "auth-service:3001"
    "user-service:3002"
    "ecommerce-service:3003"
    "payment-service:3004"
    "classifieds-service:3005"
    "food-delivery-service:3006"
    "notification-service:3012"
)

# ==============================
# Deploy Services
# ==============================

print_header "Deploying Services to Cloud Run"

DEPLOYED=0
FAILED=0

for SERVICE_PORT in "${SERVICES[@]}"; do
    IFS=':' read -r SERVICE PORT <<< "$SERVICE_PORT"
    
    print_info "Deploying $SERVICE..."
    
    SERVICE_DIR="services/$SERVICE"
    
    # Check if service directory exists
    if [ ! -d "$SERVICE_DIR" ]; then
        print_error "Directory $SERVICE_DIR not found. Skipping..."
        ((FAILED++))
        continue
    fi
    
    # Deploy to Cloud Run
    if gcloud run deploy "$SERVICE" \
        --source "./$SERVICE_DIR" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --memory "$MEMORY" \
        --cpu "$CPU" \
        --min-instances "$MIN_INSTANCES" \
        --max-instances "$MAX_INSTANCES" \
        --port "$PORT" \
        --set-env-vars "NODE_ENV=production,PORT=$PORT" \
        --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest" \
        --quiet; then
        
        print_success "$SERVICE deployed successfully"
        ((DEPLOYED++))
    else
        print_error "Failed to deploy $SERVICE"
        ((FAILED++))
    fi
    
    echo ""
done

# ==============================
# Health Check
# ==============================

print_header "Health Check"

print_info "Waiting 30 seconds for services to start..."
sleep 30

for SERVICE_PORT in "${SERVICES[@]}"; do
    IFS=':' read -r SERVICE PORT <<< "$SERVICE_PORT"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe "$SERVICE" \
        --region "$REGION" \
        --format 'value(status.url)' 2>/dev/null)
    
    if [ -z "$SERVICE_URL" ]; then
        print_error "$SERVICE - No URL found"
        continue
    fi
    
    # Check health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "$SERVICE is healthy at $SERVICE_URL"
    else
        print_error "$SERVICE returned HTTP $HTTP_CODE"
    fi
done

# ==============================
# Summary
# ==============================

print_header "Deployment Summary"
echo "Services deployed: $DEPLOYED"
echo "Services failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    print_success "All services deployed successfully! 🚀"
    echo ""
    echo "Next steps:"
    echo "1. Configure custom domain"
    echo "2. Set up monitoring alerts"
    echo "3. Test API endpoints"
    echo "4. Deploy frontend"
else
    print_error "Some services failed to deploy"
    echo "Check the logs above for details"
    exit 1
fi

# ==============================
# List All Services
# ==============================

print_header "Deployed Services"
gcloud run services list --region "$REGION"

echo ""
print_success "Deployment complete!"
