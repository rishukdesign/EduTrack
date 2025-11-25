# EduTrack Azure Deployment Guide

This guide provides step-by-step instructions for deploying the EduTrack application to Microsoft Azure.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Cost Management](#cost-management)

## Prerequisites

### Required Tools
- **Azure Account**: Active Azure subscription ([Get a free account](https://azure.microsoft.com/free/))
- **Azure CLI**: Version 2.50.0 or later ([Installation guide](https://docs.microsoft.com/cli/azure/install-azure-cli))
- **.NET SDK**: Version 9.0 or later ([Download](https://dotnet.microsoft.com/download))
- **Node.js**: Version 20.x or later ([Download](https://nodejs.org/))
- **Git**: For version control

### Verify Prerequisites
```bash
# Check Azure CLI
az --version

# Check .NET SDK
dotnet --version

# Check Node.js
node --version
npm --version
```

## Quick Start

For experienced users, here's the quick deployment process:

```bash
# 1. Login to Azure
az login

# 2. Create Azure resources
cd .azure
./setup-resources.sh

# 3. Deploy backend
./deploy-backend.sh

# 4. Deploy frontend
./deploy-frontend.sh
```

Your application will be deployed and accessible at the URLs shown in the terminal output.

## Detailed Deployment Steps

### Step 1: Azure Login

Login to your Azure account:
```bash
az login
```

This will open a browser window for authentication. Once logged in, verify your subscription:
```bash
az account list --output table
```

If you have multiple subscriptions, set the desired one:
```bash
az account set --subscription "Your Subscription Name"
```

### Step 2: Configure Deployment Settings

Edit the configuration variables in `.azure/setup-resources.sh`:

```bash
# Key variables to customize:
LOCATION="centralindia"              # Choose your Azure region
SQL_ADMIN_PASSWORD="YourSecurePass"  # Set a strong password
```

**Important Security Note**: The SQL password must meet Azure's complexity requirements:
- At least 8 characters
- Contains uppercase and lowercase letters
- Contains numbers
- Contains special characters

### Step 3: Create Azure Resources

Navigate to the `.azure` directory and run the setup script:

```bash
cd /path/to/EduTrack/.azure
./setup-resources.sh
```

This script will create:
- Resource Group
- Azure SQL Server and Database
- App Service Plan (B1 tier)
- Two App Services (Backend and Frontend)
- Firewall rules and configurations

**Duration**: Approximately 5-10 minutes

The script will generate a configuration file at `.azure/azure-config.txt` containing all resource details.

### Step 4: Deploy Backend

Deploy the .NET backend API:

```bash
./deploy-backend.sh
```

This script will:
1. Restore NuGet packages
2. Build the project in Release mode
3. Publish the application
4. Create a deployment package
5. Upload to Azure App Service
6. Run database migrations automatically

**Duration**: Approximately 3-5 minutes

### Step 5: Deploy Frontend

Deploy the React frontend:

```bash
./deploy-frontend.sh
```

This script will:
1. Install npm dependencies
2. Build the production bundle
3. Copy Azure configuration files
4. Create a deployment package
5. Upload to Azure App Service

**Duration**: Approximately 2-4 minutes

## Post-Deployment Configuration

### Configure Custom Domain (Optional)

If you want to use a custom domain:

```bash
# Add custom domain to frontend
az webapp config hostname add \
    --webapp-name <frontend-app-name> \
    --resource-group edutrack-rg \
    --hostname yourdomain.com

# Enable SSL
az webapp config ssl bind \
    --certificate-thumbprint <thumbprint> \
    --ssl-type SNI \
    --name <frontend-app-name> \
    --resource-group edutrack-rg
```

### Configure Application Insights (Recommended)

Enable monitoring and diagnostics:

```bash
# Create Application Insights resource
az monitor app-insights component create \
    --app edutrack-insights \
    --location centralindia \
    --resource-group edutrack-rg \
    --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
    --app edutrack-insights \
    --resource-group edutrack-rg \
    --query instrumentationKey -o tsv)

# Configure backend
az webapp config appsettings set \
    --name <backend-app-name> \
    --resource-group edutrack-rg \
    --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

### Database Firewall Rules

To access the database from your local machine for management:

```bash
# Add your IP address
az sql server firewall-rule create \
    --resource-group edutrack-rg \
    --server <sql-server-name> \
    --name MyLocalIP \
    --start-ip-address <your-ip> \
    --end-ip-address <your-ip>
```

## Verification

### Backend Verification

1. **Health Check**:
   ```bash
   curl https://<backend-app-name>.azurewebsites.net/health
   ```
   Expected response: `Healthy`

2. **Swagger UI**:
   Open in browser: `https://<backend-app-name>.azurewebsites.net/swagger`

3. **Test API Endpoint**:
   ```bash
   curl https://<backend-app-name>.azurewebsites.net/api/students
   ```

### Frontend Verification

1. **Open the Application**:
   Navigate to `https://<frontend-app-name>.azurewebsites.net`

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any errors in the Console tab
   - Verify API calls are successful in the Network tab

3. **Test Authentication**:
   - Try logging in with default credentials
   - Verify role-based access control

### Integration Testing

1. **Complete User Workflow**:
   - Login as different user roles
   - Create, read, update, and delete records
   - Verify data persistence

2. **Monitor Logs**:
   ```bash
   # View backend logs
   az webapp log tail \
       --name <backend-app-name> \
       --resource-group edutrack-rg
   
   # View frontend logs
   az webapp log tail \
       --name <frontend-app-name> \
       --resource-group edutrack-rg
   ```

## Troubleshooting

### Common Issues

#### Backend Not Starting

**Symptom**: 503 Service Unavailable error

**Solutions**:
1. Check application logs:
   ```bash
   az webapp log tail --name <backend-app-name> --resource-group edutrack-rg
   ```

2. Verify environment variables:
   ```bash
   az webapp config appsettings list \
       --name <backend-app-name> \
       --resource-group edutrack-rg
   ```

3. Restart the app:
   ```bash
   az webapp restart --name <backend-app-name> --resource-group edutrack-rg
   ```

#### Database Connection Issues

**Symptom**: Cannot connect to database errors in logs

**Solutions**:
1. Verify connection string:
   ```bash
   az webapp config connection-string list \
       --name <backend-app-name> \
       --resource-group edutrack-rg
   ```

2. Check firewall rules:
   ```bash
   az sql server firewall-rule list \
       --server <sql-server-name> \
       --resource-group edutrack-rg
   ```

#### CORS Errors

**Symptom**: Frontend shows CORS policy errors in browser console

**Solutions**:
1. Verify backend CORS configuration includes frontend URL
2. Check that `FrontendUrl` app setting is correct
3. Ensure both apps are using HTTPS

#### Frontend Shows Blank Page

**Symptom**: White screen or blank page

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify `VITE_API_URL` environment variable
3. Check if web.config was deployed correctly
4. Rebuild and redeploy frontend

### Getting Help

- **Azure Support**: [Azure Portal Support](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- **Documentation**: [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- **Logs**: Always check application logs first

## Cost Management

### Estimated Monthly Costs (India Central Region)

| Resource | Tier | Estimated Cost (INR) |
|----------|------|---------------------|
| Azure SQL Database | S0 Standard | ₹1,200 |
| App Service Plan | B1 Basic | ₹2,100 |
| Total | | **₹3,300/month** |

### Cost Optimization Tips

1. **Use Free Tier for Development**:
   ```bash
   az appservice plan create \
       --name edutrack-dev-plan \
       --resource-group edutrack-dev-rg \
       --sku F1  # Free tier
   ```

2. **Scale Down During Off-Hours**:
   ```bash
   # Stop apps when not in use
   az webapp stop --name <app-name> --resource-group edutrack-rg
   
   # Start when needed
   az webapp start --name <app-name> --resource-group edutrack-rg
   ```

3. **Monitor Costs**:
   - Enable cost alerts in Azure Portal
   - Review Azure Cost Management dashboard regularly
   - Set budget limits

4. **Delete Unused Resources**:
   ```bash
   # Delete entire resource group (CAUTION: This deletes everything!)
   az group delete --name edutrack-rg --yes
   ```

### Budget Alerts

Set up budget alerts to avoid unexpected costs:

```bash
az consumption budget create \
    --budget-name edutrack-monthly-budget \
    --amount 5000 \
    --time-grain Monthly \
    --resource-group edutrack-rg
```

## Maintenance

### Update Backend

```bash
cd backend
# Make your code changes
git add .
git commit -m "Update description"

# Redeploy
cd ../.azure
./deploy-backend.sh
```

### Update Frontend

```bash
cd frontend
# Make your code changes
git add .
git commit -m "Update description"

# Redeploy
cd ../.azure
./deploy-frontend.sh
```

### Database Migrations

When you add new migrations:

```bash
# Create migration locally
cd backend
dotnet ef migrations add YourMigrationName

# Commit the migration files
git add Migrations/
git commit -m "Add new migration"

# Deploy backend (migrations run automatically on startup in production)
cd ../.azure
./deploy-backend.sh
```

## Security Best Practices

1. **Store Secrets Securely**:
   - Use Azure Key Vault for sensitive data
   - Never commit passwords to Git
   - Rotate SQL passwords regularly

2. **Enable HTTPS Only**:
   - Already configured in deployment scripts
   - Use Azure Front Door for additional security

3. **Restrict SQL Access**:
   - Limit firewall rules to specific IPs
   - Use Azure AD authentication when possible

4. **Monitor Security**:
   - Enable Azure Security Center
   - Review security recommendations regularly
   - Set up alerts for suspicious activity

## Next Steps

After successful deployment:

1. ✅ Test all application features thoroughly
2. ✅ Set up continuous deployment with GitHub Actions
3. ✅ Configure custom domain and SSL
4. ✅ Enable Application Insights for monitoring
5. ✅ Set up automated backups
6. ✅ Create staging environment for testing
7. ✅ Document any custom configurations

---

**Need Help?** Check the troubleshooting section or review Azure documentation for detailed guidance.
