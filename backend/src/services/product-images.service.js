import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import ApiError from "../utils/ApiError.js";

export async function uploadProductImage(file, tenantId) {
  const bytes = file.buffer;
  const valid =
    (file.mimetype === "image/jpeg" &&
      bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) ||
    (file.mimetype === "image/png" &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (file.mimetype === "image/webp" &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP");
  if (!valid)
    throw new ApiError(400, "The file contents do not match its image type");
  const required = [
    "CLOUD_STORAGE_ACCOUNT_ID",
    "CLOUD_STORAGE_ACCESS_KEY",
    "CLOUD_STORAGE_SECRET_KEY",
    "CLOUD_STORAGE_BUCKET",
    "CLOUD_STORAGE_PUBLIC_URL",
  ];
  if (required.some((key) => !process.env[key]))
    throw new ApiError(503, "Image storage is not configured");
  let publicBase;
  try {
    publicBase = new URL(process.env.CLOUD_STORAGE_PUBLIC_URL);
  } catch {
    throw new ApiError(503, "Image storage requires a valid HTTPS public URL");
  }
  if (
    publicBase.protocol !== "https:" ||
    publicBase.username ||
    publicBase.password ||
    publicBase.search ||
    publicBase.hash
  )
    throw new ApiError(
      503,
      "Image storage requires an HTTPS public URL without credentials, query or fragment",
    );
  if (!/^[a-f\d]{32}$/i.test(process.env.CLOUD_STORAGE_ACCOUNT_ID))
    throw new ApiError(503, "Image storage account ID is invalid");
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.mimetype];
  const key = `stores/${tenantId}/products/${randomUUID()}.${extension}`;
  const client = new S3Client({
    maxAttempts: 2,
    requestHandler: { connectionTimeout: 5000, requestTimeout: 15000 },
    region: "auto",
    endpoint: `https://${process.env.CLOUD_STORAGE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY,
      secretAccessKey: process.env.CLOUD_STORAGE_SECRET_KEY,
    },
  });
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUD_STORAGE_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: file.mimetype,
      }),
      { abortSignal: AbortSignal.timeout(20000) },
    );
  } catch {
    throw new ApiError(
      503,
      "Image storage is unavailable. Please try again later.",
    );
  } finally {
    client.destroy();
  }
  return {
    url: `${publicBase.href.replace(/\/$/, "")}/${key}`,
    public_id: key,
  };
}
