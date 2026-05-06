import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

function getAllowedDevOrigins() {
  const interfaces = networkInterfaces();
  const origins = new Set<string>();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        origins.add(address.address);
      }
    }
  }

  const extraOrigins = process.env.DEV_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of extraOrigins ?? []) {
    origins.add(origin);
  }

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
