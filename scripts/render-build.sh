#!/bin/bash
# Render build script for monorepo services
# Usage: ./scripts/render-build.sh <service-name>

set -e  # Exit on error

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
  echo "Error: Service name required"
  echo "Usage: ./scripts/render-build.sh <service-name>"
  exit 1
fi

echo "=========================================="
echo "Building $SERVICE_NAME for Render"
echo "=========================================="

# Step 1: Install shared package dependencies
echo ""
echo "Step 1: Installing shared package dependencies..."
cd packages/shared
npm install
echo "✓ Shared package dependencies installed"

# Step 2: Install service dependencies
echo ""
echo "Step 2: Installing $SERVICE_NAME dependencies..."
cd ../../services/$SERVICE_NAME
npm install
echo "✓ Service dependencies installed"

# Step 3: Verify installation
echo ""
echo "Step 3: Verifying installation..."
echo "Checking for winston in shared package..."
if [ -d "../../packages/shared/node_modules/winston" ]; then
  echo "✓ Winston found in shared package"
else
  echo "✗ Winston NOT found in shared package"
  exit 1
fi

echo ""
echo "=========================================="
echo "Build completed successfully!"
echo "=========================================="
