"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getKeysFromSessionId } from "@/lib/db/supabase";
import { s3Client } from "@/lib/storage/r2";

async function getKeysFromDB(sessionId: string) {
    return await getKeysFromSessionId(sessionId);
}

export async function getMultipleSignedUrls(sessionId: string) {
    const urlPromises = (await getKeysFromDB(sessionId)).map(async (key) => {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key.processed_r2_key,
        });

        const url = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        });

        return url;
    });

    return await Promise.all(urlPromises);
}
