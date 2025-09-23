"use server";

import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/storage/r2";
import { R2PathManager } from "@/lib/storage/r2-path";

async function generateSessionId() {
  return randomUUID();
}

export async function getUploadUrl(
  sessionId: string,
  fileName: string,
  mimeType: string,
) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const imageId =
    lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension =
    lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1) : "";

  const pathManager = new R2PathManager();
  const key = pathManager.getOriginalImagePath(sessionId, imageId, extension);

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
  files: Array<{ name: string; type: string }>,
) {
  const sessionId = await generateSessionId();

  const urls = await Promise.all(
    files.map((file) => getUploadUrl(sessionId, file.name, file.type)),
  );
  return urls;
}
