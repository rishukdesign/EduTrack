#!/bin/bash

# Deploy EduTrack Backend to Azure
set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}EduTrack Backend Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Load configuration
if [ -f ".azure/azure-config.txt" ]; then
    source .azure/azure-config.txt
else
    echo "Configuration file not found. Please run setup-resources.sh first."
    exit 1
fi

echo -e "${YELLOW}Building backend...${NC}"
cd backend

# Restore packages
dotnet restore

# Build in Release mode
dotnet build --configuration Release

# Publish
echo -e "${YELLOW}Publishing backend...${NC}"
dotnet publish --configuration Release --output ./publish

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
cd publish
zip -r ../deploy.zip .
cd ..

# Deploy to Azure
echo -e "${YELLOW}Deploying to Azure App Service...${NC}"
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $BACKEND_APP_NAME \
    --src deploy.zip

# Clean up
rm deploy.zip
rm -rf publish

echo ""
echo -e "${GREEN}Backend deployed successfully!${NC}"
echo -e "${YELLOW}Backend URL: $BACKEND_URL${NC}"
echo -e "${YELLOW}Swagger UI: $BACKEND_URL/swagger${NC}"
echo -e "${YELLOW}Health Check: $BACKEND_URL/health${NC}"
echo ""
