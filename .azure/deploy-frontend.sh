#!/bin/bash

# Deploy EduTrack Frontend to Azure
set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}EduTrack Frontend Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Load configuration
if [ -f ".azure/azure-config.txt" ]; then
    source .azure/azure-config.txt
else
    echo "Configuration file not found. Please run setup-resources.sh first."
    exit 1
fi

echo -e "${YELLOW}Building frontend...${NC}"
cd frontend

# Install dependencies
npm install

# Build for production
echo -e "${YELLOW}Creating production build...${NC}"
npm run build

# Copy web.config to dist folder for Azure routing
cp web.config dist/

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
cd dist
zip -r ../deploy.zip .
cd ..

# Deploy to Azure
echo -e "${YELLOW}Deploying to Azure App Service...${NC}"
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $FRONTEND_APP_NAME \
    --src deploy.zip

# Clean up
rm deploy.zip

echo ""
echo -e "${GREEN}Frontend deployed successfully!${NC}"
echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo ""
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${YELLOW}Your EduTrack application is now live at:${NC}"
echo -e "${GREEN}$FRONTEND_URL${NC}"
echo ""
