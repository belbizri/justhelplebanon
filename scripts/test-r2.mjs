import "dotenv/config";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCT         = process.env.CF_ACCOUNT_ID   || "29fd1145e8657acb0b3f429abdad1ea1";
const BUCKET       = process.env.R2_BUCKET        || "justhelplebanonvideos";
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const ENDPOINT     = process.env.R2_ENDPOINT || `https://${ACCT}.r2.cloudflarestorage.com`;

// ── 1. CF REST API: list buckets ──────────────────────────────
console.log("=== 1. CF REST API: list R2 buckets ===");
try {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCT}/r2/buckets`,
    { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } }
  );
  const body = await r.json();
  console.log("status:", r.status);
  console.log(JSON.stringify(body, null, 2));
} catch (e) {
  console.error("CF REST error:", e.message);
}

// ── 2. S3 client with cfat_ token as accessKeyId (won't work, confirms diagnosis) ──
console.log("\n=== 2. S3 ListObjects using cfat_ as accessKeyId ===");
try {
  const s3 = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: { accessKeyId: CF_API_TOKEN, secretAccessKey: "not-an-r2-secret" },
  });
  const data = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 5 }));
  console.log("Objects:", data.Contents?.map(o => o.Key));
} catch (e) {
  console.error("S3 (cfat_) error:", e.message);
}

// ── 3. If R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are set in env, test real S3 ──
const akid = process.env.R2_ACCESS_KEY_ID;
const sak  = process.env.R2_SECRET_ACCESS_KEY;
if (akid && sak) {
  console.log("\n=== 2. S3 ListObjects with real R2 credentials ===");
  try {
    const s3 = new S3Client({
      region: "auto",
      endpoint: ENDPOINT,
      credentials: { accessKeyId: akid, secretAccessKey: sak },
    });
    const data = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 20 }));
    const keys = data.Contents?.map(o => o.Key) ?? [];
    const videoKeys = keys.filter(k => k && !k.endsWith("/"));
    console.log(`Found ${keys.length} objects:`);
    keys.forEach(k => console.log("  •", k));

    if (videoKeys.length > 0) {
      console.log("\n=== 3. Signed URL for first object ===");
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: videoKeys[0] }),
        { expiresIn: 3600 }
      );
      console.log(url);

      console.log("\n=== 4. Signed URL GET range probe ===");
      const probe = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-1" },
      });
      console.log("status:", probe.status);
      console.log("content-type:", probe.headers.get("content-type"));
      console.log("content-range:", probe.headers.get("content-range"));
      console.log("accept-ranges:", probe.headers.get("accept-ranges"));
    }
  } catch (e) {
    console.error("S3 (real creds) error:", e.message);
  }
} else {
  console.log("\n=== 2. Skipped — R2 credentials are not configured ===");
}
