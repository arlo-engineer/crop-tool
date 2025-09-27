"use server";

import { uploadToR2 } from "@/lib/storage/r2";
import { R2PathManager } from "@/lib/storage/r2-path";

export async function processImages(formData: FormData) {
    try {
        const sessionId = formData.get("sessionId") as string
        const pathManager = new R2PathManager();

        const files: File[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file-') && value instanceof File) {
                files.push(value);
            }
        }

        const results = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const imageBuffer = Buffer.from(arrayBuffer);

                // add processing
                const processedBuffer = imageBuffer;

                const r2Key = pathManager.getProcessedImagePath(sessionId, file.name);
                await uploadToR2(r2Key, processedBuffer, file.type);

                return {
                    session_id: sessionId,
                    original_name: file.name,
                    processed_r2_key: r2Key,
                    size: processedBuffer.length,
                    status: 'completed',
                };
            })
        );

        // save db

        return {
            success: true,
            results
        };

    } catch (error) {
        console.error('Processing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
