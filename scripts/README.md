# Deployment Scripts

This directory contains automated deployment scripts for SuperApp MGrand Hub.

## Available Scripts

### 1. `deploy-to-cloud-run.sh` (Linux/Mac)
Bash script to deploy all services to Google Cloud Run.

**Usage:**
```bash
chmod +x deploy-to-cloud-run.sh
./deploy-to-cloud-run.sh
```

### 2. `deploy-to-cloud-run.ps1` (Windows)
PowerShell script to deploy all services to Google Cloud Run.

**Usage:**
```powershell
.\deploy-to-cloud-run.ps1
```

## Prerequisites

Before running these scripts:

1. **Install Google Cloud SDK**
   - Download from: https://cloud.google.com/sdk/docs/install

2. **Authenticate**
   ```bash
   gcloud auth login
   ```

3. **Create Project**
   ```bash
   gcloud projects create mgrand-hub-prod
   gcloud config set project mgrand-hub-prod
   ```

4. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

5. **Set Up Secrets**
   ```bash
   echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
   echo -n "mongodb://..." | gcloud secrets create mongo-uri --data-file=-
   ```

## Configuration

Edit the configuration section in the scripts to customize:

- `PROJECT_ID`: Your Google Cloud project ID
- `REGION`: Deployment region (default: us-central1)
- `MEMORY`: Memory allocation per service (default: 512Mi)
- `CPU`: CPU allocation (default: 1)
- `MIN_INSTANCES`: Minimum instances (default: 0 for scale-to-zero)
- `MAX_INSTANCES`: Maximum instances (default: 10)

## Services Deployed

The scripts deploy these services:
- auth-service (Port 3001)
- user-service (Port 3002)
- ecommerce-service (Port 3003)
- payment-service (Port 3004)
- classifieds-service (Port 3005)
- food-delivery-service (Port 3006)
- notification-service (Port 3012)

## What the Scripts Do

1. **Pre-flight checks**: Verify gcloud CLI and authentication
2. **Deploy services**: Deploy each service to Cloud Run
3. **Health checks**: Verify services are running
4. **Summary**: Display deployment results

## Troubleshooting

### Permission Denied (Linux/Mac)
```bash
chmod +x deploy-to-cloud-run.sh
```

### Execution Policy Error (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Service Deployment Fails
- Check service directory exists
- Verify Dockerfile is present
- Check Cloud Build logs in GCP Console
- Ensure secrets are created

### Health Check Fails
- Wait a few more minutes for service to start
- Check Cloud Run logs: `gcloud run services logs read SERVICE_NAME`
- Verify environment variables are set correctly

## Manual Deployment

To deploy a single service manually:

```bash
cd services/auth-service

gcloud run deploy auth-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --port 3001
```

## Cost Management

These scripts deploy services with:
- Scale-to-zero enabled (MIN_INSTANCES=0)
- Moderate memory (512Mi)
- Conservative max instances (10)

This configuration balances cost and performance. Adjust based on your needs.

## Next Steps

After deployment:
1. Configure custom domain
2. Set up monitoring and alerts
3. Configure CI/CD pipeline
4. Load test your services
5. Set up backup strategy

## Support

For issues:
- Check the main PUBLISHING_GUIDE.md
- Review Cloud Run logs
- Visit: https://cloud.google.com/run/docs
