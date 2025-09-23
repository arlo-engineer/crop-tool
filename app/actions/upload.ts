"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/storage/r2";

export async function getUploadUrl(fileName: string, mimeType: string) {
  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1hour
  });

  return { url, key };
}

export async function getMultipleUploadUrls(
  files: Array<{ name: string; type: string }>
) {
  const urls = await Promise.all(
    files.map(file => getUploadUrl(file.name, file.type))
  );
  return urls;
}
