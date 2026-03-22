import "dotenv/config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, writeFileSync } from "fs";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;

// 1. List all objects in bucket
const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
const keys = (list.Contents || []).filter(o => !o.Key.endsWith("/")).map(o => o.Key);

// 2. Read manifest
const manifest = JSON.parse(readFileSync("public/data/videos.json", "utf8"));
const manifestKeys = manifest.map(v => v.src.replace(/^\/+/, ""));

// 3. Compare
const result = {
  r2Keys: keys,
  manifestKeys,
  inManifestNotR2: manifestKeys.filter(k => !keys.includes(k)),
  inR2NotManifest: keys.filter(k => !manifestKeys.includes(k)),
};

// 4. Test one signed URL
if (keys.length > 0) {
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: keys[0] }), { expiresIn: 3600 });
  result.sampleSignedUrl = url.substring(0, 100) + "...";
}

writeFileSync("r2-check-result.json", JSON.stringify(result, null, 2));
console.log("DONE");
