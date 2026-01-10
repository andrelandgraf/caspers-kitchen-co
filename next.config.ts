import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@node-rs/xxhash"],
};

export default withWorkflow(nextConfig);
