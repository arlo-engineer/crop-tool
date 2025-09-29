"use server";

import { sessionCache } from "@/lib/cache/sessionCache";
import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";
import { saveMultipleImageMetadata } from "@/lib/db/supabase";
import { uploadToR2 } from "@/lib/storage/r2";
import { R2PathManager } from "@/lib/storage/r2-path";
import type { ImageStatus } from "@/lib/types/database";
import {
	processImage,
	validateImageBuffer,
} from "@/lib/utils/imageProcessor";

export async function processImages(formData: FormData) {
	try {
		const sessionId = formData.get("sessionId") as string;
		const pathManager = new R2PathManager();

		const files = getFilesFromFormData(formData);

		for (const file of files) {
			if (
				!CONFIG.ALLOWED_MIME_TYPES.includes(
					file.type as (typeof CONFIG.ALLOWED_MIME_TYPES)[number],
				)
			) {
				throw new Error(`${TEXTS.INVALID_FILE_TYPE_MESSAGE}\n(${file.name})`);
			}
		}

		const results = await Promise.all(
			files.map(async (file) => {
				const arrayBuffer = await file.arrayBuffer();
				const imageBuffer = Buffer.from(arrayBuffer);

				const isValid = await validateImageBuffer(imageBuffer);
				if (!isValid) {
					throw new Error(
						`${TEXTS.INVALID_IMAGE_BUFFER_MESSAGE}\n(${file.name})`,
					);
				}

				const processedBuffer = await processImage(imageBuffer);

				const r2Key = pathManager.getProcessedImagePath(sessionId, file.name);

				await uploadToR2(
					r2Key,
					processedBuffer,
					`image/${CONFIG.IMAGE_PROCESSING.FORMAT}`,
				);

				return {
					session_id: sessionId,
					original_name: file.name,
					processed_r2_key: r2Key,
					status: "completed" as ImageStatus,
				};
			}),
		);

		await sessionCache.addImage(sessionId, results);

		return {
			success: true,
			results,
		};
	} catch (error) {
		console.error("Processing error:", error);
		const sessionId = formData.get("sessionId") as string;
		const files = getFilesFromFormData(formData);

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
