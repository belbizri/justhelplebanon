import "dotenv/config";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnvVars = [
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} must be set in the environment.`);
  }
}

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const ORG_BUCKET = process.env.R2_ORG_BUCKET || "orgvideos";

export async function getVideoUrl(key, ttl = 3600) {
  if (!key || typeof key !== "string") {
    throw new TypeError("key must be a non-empty string.");
  }

  const safeKey = key.replace(/^\/+/, "");

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: safeKey,
  });

  return getSignedUrl(s3, command, { expiresIn: ttl });
}

export async function getOrgVideoUrl(key, ttl = 3600) {
  if (!key || typeof key !== "string") {
    throw new TypeError("key must be a non-empty string.");
  }

  const safeKey = key.replace(/^\/+/, "");

  const command = new GetObjectCommand({
    Bucket: ORG_BUCKET,
    Key: safeKey,
  });

  return getSignedUrl(s3, command, { expiresIn: ttl });
}
