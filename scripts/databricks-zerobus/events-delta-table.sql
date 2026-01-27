-- Step 1: Drop the old table (in default catalog)
DROP TABLE IF EXISTS default.events;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS casperskitchencocom.events.events;

-- Step 2: Create Unity Catalog structure
CREATE CATALOG IF NOT EXISTS casperskitchencocom;
CREATE SCHEMA IF NOT EXISTS casperskitchencocom.events;

-- Step 3: Create the managed table in Unity Catalog
-- The key is using the 3-part name: catalog.schema.table
CREATE TABLE casperskitchencocom.events.events (
  event_type STRING NOT NULL,
  timestamp BIGINT NOT NULL,
  user_id STRING,
  session_id STRING,
  source STRING NOT NULL,
  payload STRING NOT NULL
)
COMMENT 'Event stream from Caspers Kitchen web application';

-- Step 4: Verify it's in Unity Catalog (should show managed table)
DESCRIBE TABLE EXTENDED casperskitchencocom.events.events;