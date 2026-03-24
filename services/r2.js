import "dotenv/config";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnvVars = [
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET",
];

export const getMissingR2EnvVars = () =>
  requiredEnvVars.filter((envVar) => !process.env[envVar]);

export const isR2Configured = () => getMissingR2EnvVars().length === 0;

const getR2Client = () => {
  const missingEnvVars = getMissingR2EnvVars();

  if (missingEnvVars.length > 0) {
    throw new Error(`${missingEnvVars.join(", ")} must be set in the environment.`);
  }

  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
};

const getBuckets = () => ({
  bucket: process.env.R2_BUCKET,
  orgBucket: process.env.R2_ORG_BUCKET || "orgvideos",
});

export async function getVideoUrl(key, ttl = 3600) {
  if (!key || typeof key !== "string") {
    throw new TypeError("key must be a non-empty string.");
  }

  const s3 = getR2Client();
  const { bucket } = getBuckets();
  const safeKey = key.replace(/^\/+/, "");

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: safeKey,
  });

  return getSignedUrl(s3, command, { expiresIn: ttl });
}

export async function getOrgVideoUrl(key, ttl = 3600) {
  if (!key || typeof key !== "string") {
    throw new TypeError("key must be a non-empty string.");
  }

  const s3 = getR2Client();
  const { orgBucket } = getBuckets();
  const safeKey = key.replace(/^\/+/, "");

  const command = new GetObjectCommand({
    Bucket: orgBucket,
    Key: safeKey,
  });

  return getSignedUrl(s3, command, { expiresIn: ttl });
}
