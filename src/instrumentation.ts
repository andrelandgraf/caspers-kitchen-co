// Validate required configs on server start
import "./lib/db/config";
import "./lib/ai/config";
import "./lib/auth/config";
import "./lib/resend/config";
// Databricks config is optional - validated lazily when used
