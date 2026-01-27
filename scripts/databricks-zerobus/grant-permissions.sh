#!/bin/bash
# Grant permissions to an existing Databricks service principal
#
# Prerequisites:
# 1. Databricks CLI installed and configured
# 2. DATABRICKS_ZEROBUS_TABLE env var set
# 3. DATABRICKS_CLIENT_ID env var set (the application ID)
#
# Usage:
#   ./scripts/databricks-zerobus/grant-permissions.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Load environment variables
if [ -f .env.development ]; then
  export $(grep -v '^#' .env.development | grep DATABRICKS | xargs)
fi

# Validate required vars
if [ -z "$DATABRICKS_ZEROBUS_TABLE" ]; then
  echo -e "${RED}Error: DATABRICKS_ZEROBUS_TABLE not set${NC}"
  exit 1
fi

if [ -z "$DATABRICKS_CLIENT_ID" ]; then
  echo -e "${RED}Error: DATABRICKS_CLIENT_ID not set${NC}"
  exit 1
fi

# Parse table name
IFS='.' read -r CATALOG SCHEMA TABLE <<< "$DATABRICKS_ZEROBUS_TABLE"

echo "Granting permissions to service principal: $DATABRICKS_CLIENT_ID"
echo "Target: $CATALOG.$SCHEMA.$TABLE"
echo ""

# Grant permissions
echo -e "${GREEN}Granting USE_CATALOG on $CATALOG...${NC}"
databricks grants update catalog "$CATALOG" --json "{
  \"changes\": [{\"principal\": \"$DATABRICKS_CLIENT_ID\", \"add\": [\"USE_CATALOG\"]}]
}"

echo -e "${GREEN}Granting USE_SCHEMA on $CATALOG.$SCHEMA...${NC}"
databricks grants update schema "$CATALOG.$SCHEMA" --json "{
  \"changes\": [{\"principal\": \"$DATABRICKS_CLIENT_ID\", \"add\": [\"USE_SCHEMA\"]}]
}"

echo -e "${GREEN}Granting MODIFY, SELECT on $CATALOG.$SCHEMA.$TABLE...${NC}"
databricks grants update table "$CATALOG.$SCHEMA.$TABLE" --json "{
  \"changes\": [{\"principal\": \"$DATABRICKS_CLIENT_ID\", \"add\": [\"MODIFY\", \"SELECT\"]}]
}"

echo ""
echo -e "${GREEN}Done! Permissions granted.${NC}"
