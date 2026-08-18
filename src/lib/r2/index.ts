import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const s3Client = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function getPresignedUrl(key: string, contentType: string) {
  if (!env.R2_ACCESS_KEY_ID) {
    return { error: "R2 credentials not configured" };
  }

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;
    return { url, publicUrl };
  } catch (error) {
    console.error("R2 Error:", error);
    return { error: "Failed to generate presigned URL" };
  }
}
