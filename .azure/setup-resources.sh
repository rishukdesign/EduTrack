#!/bin/bash

# Azure Resource Setup Script for EduTrack
# This script creates all necessary Azure resources for the EduTrack application

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}EduTrack Azure Resource Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration - Edit these variables as needed
RESOURCE_GROUP="edutrack-rg"
LOCATION="centralindia"  # or "southindia" for India regions
SQL_SERVER_NAME="edutrack-sql-server-$RANDOM"
SQL_DB_NAME="edutrack-db"
SQL_ADMIN_USER="edutrackadmin"
SQL_ADMIN_PASSWORD="EduTrack@2025!Secure"  # Change this to a secure password
APP_SERVICE_PLAN="edutrack-plan"
BACKEND_APP_NAME="edutrack-backend-$RANDOM"
FRONTEND_APP_NAME="edutrack-frontend-$RANDOM"

echo -e "${YELLOW}Configuration:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "SQL Server: $SQL_SERVER_NAME"
echo "Backend App: $BACKEND_APP_NAME"
echo "Frontend App: $FRONTEND_APP_NAME"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
echo -e "${YELLOW}Checking Azure login status...${NC}"
az account show &> /dev/null || {
    echo -e "${YELLOW}Please login to Azure...${NC}"
    az login
}

# Create Resource Group
echo -e "${YELLOW}Creating resource group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# Create App Service Plan (F1 Free tier)
echo -e "${YELLOW}Creating App Service Plan (Free Tier)...${NC}"
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku F1 \
    --is-linux

# Create SQL Server
echo -e "${YELLOW}Creating Azure SQL Server...${NC}"
az sql server create \
    --name $SQL_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --admin-user $SQL_ADMIN_USER \
    --admin-password $SQL_ADMIN_PASSWORD

# Configure firewall to allow Azure services
echo -e "${YELLOW}Configuring SQL Server firewall...${NC}"
az sql server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server $SQL_SERVER_NAME \
    --name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

# Create SQL Database (Basic tier - lowest cost option)
echo -e "${YELLOW}Creating SQL Database (Basic Tier)...${NC}"
az sql db create \
    --resource-group $RESOURCE_GROUP \
    --server $SQL_SERVER_NAME \
    --name $SQL_DB_NAME \
    --service-objective Basic \
    --backup-storage-redundancy Local

# Create Backend App Service
echo -e "${YELLOW}Creating Backend App Service...${NC}"
az webapp create \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "DOTNET|9.0"

# Create Frontend App Service
echo -e "${YELLOW}Creating Frontend App Service...${NC}"
az webapp create \
    --name $FRONTEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "NODE|20-lts"

# Get SQL Connection String
CONNECTION_STRING="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Initial Catalog=${SQL_DB_NAME};Persist Security Info=False;User ID=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Configure Backend App Settings
echo -e "${YELLOW}Configuring Backend App settings...${NC}"
az webapp config appsettings set \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        ConnectionStrings__DefaultConnection="$CONNECTION_STRING" \
        FrontendUrl="https://${FRONTEND_APP_NAME}.azurewebsites.net" \
        ASPNETCORE_ENVIRONMENT="Production"

# Configure Frontend App Settings
echo -e "${YELLOW}Configuring Frontend App settings...${NC}"
az webapp config appsettings set \
    --name $FRONTEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        VITE_API_URL="https://${BACKEND_APP_NAME}.azurewebsites.net"

# Enable HTTPS only
echo -e "${YELLOW}Enabling HTTPS only...${NC}"
az webapp update \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --https-only true

az webapp update \
    --name $FRONTEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --https-only true

# Save configuration to file
CONFIG_FILE=".azure/azure-config.txt"
echo -e "${YELLOW}Saving configuration to $CONFIG_FILE...${NC}"
cat > $CONFIG_FILE <<EOF
# EduTrack Azure Configuration
# Generated on $(date)

RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION
SQL_SERVER_NAME=$SQL_SERVER_NAME
SQL_DB_NAME=$SQL_DB_NAME
SQL_ADMIN_USER=$SQL_ADMIN_USER
BACKEND_APP_NAME=$BACKEND_APP_NAME
FRONTEND_APP_NAME=$FRONTEND_APP_NAME

# URLs
BACKEND_URL=https://${BACKEND_APP_NAME}.azurewebsites.net
FRONTEND_URL=https://${FRONTEND_APP_NAME}.azurewebsites.net

# Connection String (Store securely!)
CONNECTION_STRING=$CONNECTION_STRING
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Azure Resources Created Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Resource Details:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Backend URL: https://${BACKEND_APP_NAME}.azurewebsites.net"
echo "Frontend URL: https://${FRONTEND_APP_NAME}.azurewebsites.net"
echo "SQL Server: ${SQL_SERVER_NAME}.database.windows.net"
echo ""
echo -e "${YELLOW}Configuration saved to: $CONFIG_FILE${NC}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Run ./deploy-backend.sh to deploy the backend"
echo "2. Run ./deploy-frontend.sh to deploy the frontend"
echo ""
