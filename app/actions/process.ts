"use server";

import { sessionCache } from "@/lib/cache/sessionCache";
import { saveMultipleImageMetadata } from "@/lib/db/supabase";
import { uploadToR2 } from "@/lib/storage/r2";
import { R2PathManager } from "@/lib/storage/r2-path";
import type { ImageStatus } from "@/lib/types/database";

export async function processImages(formData: FormData) {
	try {
		const sessionId = formData.get("sessionId") as string;
		const pathManager = new R2PathManager();

		const files = getFilesFromFormData(formData);

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
					status: "completed" as ImageStatus,
				};
			}),
		);

		// save to cache
		await sessionCache.addImage(sessionId, results);

		return {
			success: true,
			results,
		};
	} catch (error) {
		console.error("Processing error:", error);
		const sessionId = formData.get("sessionId") as string;
		const files = getFilesFromFormData(formData);

		// save to cache
		await sessionCache.addImage(
			sessionId,
			files.map((file: File) => ({
				session_id: sessionId,
				original_name: file.name,
				processed_r2_key: "",
				status: "error" as ImageStatus,
				error_message: error instanceof Error ? error.message : "Unknown error",
			})),
		);

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

function getFilesFromFormData(formData: FormData) {
	const files: File[] = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith("file-") && value instanceof File) {
			files.push(value);
		}
	}
	return files;
}

export async function flushImagesToDB(sessionId: string) {
	const metadata = await sessionCache.getImages(sessionId);

	if (metadata.length === 0) return;

	await saveMultipleImageMetadata(
		metadata.map((image) => ({
			session_id: image.session_id,
			original_name: image.original_name,
			processed_r2_key: image.processed_r2_key,
			status: image.status,
			...(image.error_message && { error_message: image.error_message }),
		})),
	);

	await sessionCache.clearImages(sessionId);
}
