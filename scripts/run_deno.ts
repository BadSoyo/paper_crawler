import { S3Client } from "jsr:@bradenmacdonald/s3-lite-client@0.9.0";

const ak = Deno.env.get("REAL_AK");
const sk = Deno.env.get("REAL_SK");

if (!ak || !sk) {
  throw new Error("Missing MINIO_ACCESS_KEY or MINIO_SECRET_KEY in environment");
}

const s3client = new S3Client({
  endPoint: "192.168.1.219",
  port: 9000,
  useSSL: false,
  region: "cn-xiamen",
  accessKey: ak,
  secretKey: sk,
  bucket: "electrolyte-brain",
  pathStyle: true,
});

Deno.serve({ hostname: "0.0.0.0", port: 8000 }, async (req) => {
  const urlParse = new URL(req.url);

  if (urlParse.pathname.endsWith("/presignedPutObject")) {
    const doi = urlParse.searchParams.get("doi");
    const file_name = urlParse.searchParams.get("file_name");

    const key = `${doi!.replace("_", "/")}/${file_name}`;

    try {
      await s3client.getObject(key);
      return Response.json({ error: "file existed", reload: false });
    } catch {
      const url = await s3client.getPresignedUrl("PUT", key, {
        expirySeconds: 15 * 60,
      });
      return Response.json({ url, reload: false });
    }
  }

  return Response.json({ error: "Not supported", reload: true });
});
