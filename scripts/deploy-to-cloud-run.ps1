# SuperApp MGrand Hub - Cloud Run Deployment Script (PowerShell)
# This script automates the deployment of all microservices to Google Cloud Run

$ErrorActionPreference = "Stop"

# ==============================
# Configuration
# ==============================

$PROJECT_ID = "mgrand-hub-prod"
$REGION = "us-central1"
$MIN_INSTANCES = 0
$MAX_INSTANCES = 10
$MEMORY = "512Mi"
$CPU = 1

# ==============================
# Functions
# ==============================

function Write-Header {
    param([string]$Message)
    Write-Host "`n================================" -ForegroundColor Green
    Write-Host $Message -ForegroundColor Green
    Write-Host "================================`n" -ForegroundColor Green
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-InfoMsg {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# ==============================
# Pre-flight Checks
# ==============================

Write-Header "Pre-flight Checks"

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
}
Write-Success "gcloud CLI found"

# Set project
gcloud config set project $PROJECT_ID
Write-Success "Project set to $PROJECT_ID"

# ==============================
# Service Definitions
# ==============================

$SERVICES = @(
    @{Name="auth-service"; Port=3001},
    @{Name="user-service"; Port=3002},
    @{Name="ecommerce-service"; Port=3003},
    @{Name="payment-service"; Port=3004},
    @{Name="classifieds-service"; Port=3005},
    @{Name="food-delivery-service"; Port=3006},
    @{Name="notification-service"; Port=3012}
)

# ==============================
# Deploy Services
# ==============================

Write-Header "Deploying Services to Cloud Run"

$Deployed = 0
$Failed = 0

foreach ($Service in $SERVICES) {
    $ServiceName = $Service.Name
    $Port = $Service.Port
    
    Write-InfoMsg "Deploying $ServiceName..."
    
    $ServiceDir = "services\$ServiceName"
    
    # Check if service directory exists
    if (-not (Test-Path $ServiceDir)) {
        Write-ErrorMsg "Directory $ServiceDir not found. Skipping..."
        $Failed++
        continue
    }
    
    try {
        # Deploy to Cloud Run
        gcloud run deploy $ServiceName `
            --source ".\$ServiceDir" `
            --platform managed `
            --region $REGION `
            --allow-unauthenticated `
            --memory $MEMORY `
            --cpu $CPU `
            --min-instances $MIN_INSTANCES `
            --max-instances $MAX_INSTANCES `
            --port $Port `
            --set-env-vars "NODE_ENV=production,PORT=$Port" `
            --set-secrets "JWT_SECRET=jwt-secret:latest,MONGO_URI=mongo-uri:latest" `
            --quiet
        
        Write-Success "$ServiceName deployed successfully"
        $Deployed++
    }
    catch {
        Write-ErrorMsg "Failed to deploy $ServiceName"
        $Failed++
    }
    
    Write-Host ""
}

# ==============================
# Health Check
# ==============================

Write-Header "Health Check"

Write-InfoMsg "Waiting 30 seconds for services to start..."
Start-Sleep -Seconds 30

foreach ($Service in $SERVICES) {
    $ServiceName = $Service.Name
    
    # Get service URL
    $ServiceURL = gcloud run services describe $ServiceName `
        --region $REGION `
        --format 'value(status.url)' 2>$null
    
    if ([string]::IsNullOrEmpty($ServiceURL)) {
        Write-ErrorMsg "$ServiceName - No URL found"
        continue
    }
    
    try {
        # Check health endpoint
        $Response = Invoke-WebRequest -Uri "$ServiceURL/health" -Method Get -UseBasicParsing -TimeoutSec 10
        
        if ($Response.StatusCode -eq 200) {
            Write-Success "$ServiceName is healthy at $ServiceURL"
        }
        else {
            Write-ErrorMsg "$ServiceName returned HTTP $($Response.StatusCode)"
        }
    }
    catch {
        Write-ErrorMsg "$ServiceName health check failed"
    }
}

# ==============================
# Summary
# ==============================

Write-Header "Deployment Summary"
Write-Host "Services deployed: $Deployed"
Write-Host "Services failed: $Failed"
Write-Host ""

if ($Failed -eq 0) {
    Write-Success "All services deployed successfully! 🚀"
    Write-Host "`nNext steps:"
    Write-Host "1. Configure custom domain"
    Write-Host "2. Set up monitoring alerts"
    Write-Host "3. Test API endpoints"
    Write-Host "4. Deploy frontend"
}
else {
    Write-ErrorMsg "Some services failed to deploy"
    Write-Host "Check the logs above for details"
    exit 1
}

# ==============================
# List All Services
# ==============================

Write-Header "Deployed Services"
gcloud run services list --region $REGION

Write-Host ""
Write-Success "Deployment complete!"
