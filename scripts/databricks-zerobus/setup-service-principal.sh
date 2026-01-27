#!/bin/bash
# Databricks ZeroBus Service Principal Setup
# 
# Prerequisites:
# 1. Databricks CLI installed: brew install databricks
# 2. Databricks CLI configured: databricks configure
# 3. DATABRICKS_ZEROBUS_TABLE env var set (e.g., casperskitchencocom.events.events)
#
# Usage:
#   ./scripts/databricks-zerobus/setup-service-principal.sh
#
# This script will:
# 1. Create a service principal
# 2. Generate a client secret
# 3. Grant required permissions on the table
# 4. Output the credentials to add to your .env file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Databricks ZeroBus Service Principal Setup"
echo "=========================================="
echo ""

# Load environment variables from .env.development if it exists
if [ -f .env.development ]; then
  echo "Loading .env.development..."
  export $(grep -v '^#' .env.development | grep DATABRICKS | xargs)
fi

# Check for required table name
if [ -z "$DATABRICKS_ZEROBUS_TABLE" ]; then
  echo -e "${RED}Error: DATABRICKS_ZEROBUS_TABLE environment variable not set${NC}"
  echo "Please set it in .env.development or export it:"
  echo "  export DATABRICKS_ZEROBUS_TABLE=catalog.schema.table"
  exit 1
fi

# Parse catalog.schema.table
IFS='.' read -r CATALOG SCHEMA TABLE <<< "$DATABRICKS_ZEROBUS_TABLE"

if [ -z "$CATALOG" ] || [ -z "$SCHEMA" ] || [ -z "$TABLE" ]; then
  echo -e "${RED}Error: DATABRICKS_ZEROBUS_TABLE must be in format catalog.schema.table${NC}"
  echo "Got: $DATABRICKS_ZEROBUS_TABLE"
  exit 1
fi

echo "Target table: $CATALOG.$SCHEMA.$TABLE"
echo ""

# Check if databricks CLI is installed
if ! command -v databricks &> /dev/null; then
  echo -e "${RED}Error: Databricks CLI not found${NC}"
  echo "Install it with: brew install databricks"
  exit 1
fi

# Check if databricks CLI is configured
if ! databricks auth describe &> /dev/null; then
  echo -e "${RED}Error: Databricks CLI not configured${NC}"
  echo "Configure it with: databricks configure"
  exit 1
fi

echo -e "${GREEN}Step 1: Creating service principal...${NC}"
SP_RESULT=$(databricks service-principals create --display-name "caspers-kitchen-zerobus" -o json 2>&1) || {
  echo -e "${YELLOW}Warning: Could not create service principal. It may already exist.${NC}"
  echo "Error: $SP_RESULT"
  echo ""
  echo "If the service principal already exists, you can list them with:"
  echo "  databricks service-principals list -o json"
  echo ""
  read -p "Enter existing application ID (or press Enter to exit): " APPLICATION_ID
  if [ -z "$APPLICATION_ID" ]; then
    exit 1
  fi
  SP_ID=""
}

if [ -z "$APPLICATION_ID" ]; then
  APPLICATION_ID=$(echo "$SP_RESULT" | grep -o '"applicationId": "[^"]*"' | cut -d'"' -f4)
  SP_ID=$(echo "$SP_RESULT" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
  
  echo "Service principal created:"
  echo "  Application ID: $APPLICATION_ID"
  echo "  Numeric ID: $SP_ID"
fi

echo ""
echo -e "${GREEN}Step 2: Creating client secret...${NC}"

if [ -n "$SP_ID" ]; then
  SECRET_RESULT=$(databricks service-principal-secrets create "$SP_ID" -o json 2>&1) || {
    echo -e "${RED}Error creating secret: $SECRET_RESULT${NC}"
    exit 1
  }
  CLIENT_SECRET=$(echo "$SECRET_RESULT" | grep -o '"secret": "[^"]*"' | cut -d'"' -f4)
  echo "Secret created successfully"
else
  echo -e "${YELLOW}Skipping secret creation (no numeric ID available)${NC}"
  echo "Create a secret manually with:"
  echo "  databricks service-principal-secrets create <numeric-id> -o json"
  CLIENT_SECRET="<CREATE_MANUALLY>"
fi

echo ""
echo -e "${GREEN}Step 3: Granting permissions...${NC}"

# Grant USE_CATALOG
echo "Granting USE_CATALOG on $CATALOG..."
databricks grants update catalog "$CATALOG" --json "{
  \"changes\": [{\"principal\": \"$APPLICATION_ID\", \"add\": [\"USE_CATALOG\"]}]
}" || echo -e "${YELLOW}Warning: Could not grant USE_CATALOG${NC}"

# Grant USE_SCHEMA
echo "Granting USE_SCHEMA on $CATALOG.$SCHEMA..."
databricks grants update schema "$CATALOG.$SCHEMA" --json "{
  \"changes\": [{\"principal\": \"$APPLICATION_ID\", \"add\": [\"USE_SCHEMA\"]}]
}" || echo -e "${YELLOW}Warning: Could not grant USE_SCHEMA${NC}"

# Grant MODIFY and SELECT on table
echo "Granting MODIFY, SELECT on $CATALOG.$SCHEMA.$TABLE..."
databricks grants update table "$CATALOG.$SCHEMA.$TABLE" --json "{
  \"changes\": [{\"principal\": \"$APPLICATION_ID\", \"add\": [\"MODIFY\", \"SELECT\"]}]
}" || echo -e "${YELLOW}Warning: Could not grant table permissions${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Add these to your .env.development file:"
echo ""
echo -e "${YELLOW}DATABRICKS_CLIENT_ID=\"$APPLICATION_ID\""
echo "DATABRICKS_CLIENT_SECRET=\"$CLIENT_SECRET\"${NC}"
echo ""
echo -e "${RED}IMPORTANT: Save the client secret now - it cannot be retrieved later!${NC}"
