"use server";

import { sessionCache } from "@/lib/cache/sessionCache";
import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";
import { saveMultipleImageMetadata } from "@/lib/db/supabase";
import { uploadToR2 } from "@/lib/storage/r2";
import { R2PathManager } from "@/lib/storage/r2-path";
import type { ImageStatus, UploadedImageMetadata } from "@/lib/types/database";
import type { OutputFormat } from "@/lib/types/imageProcessing";
import {
	getImageMetadata,
	processImage,
	validateImageBuffer,
} from "@/lib/utils/imageProcessor";

export async function processImages(formData: FormData) {
	try {
		const sessionId = formData.get("sessionId") as string;
		const outputFormat =
			(formData.get("outputFormat") as OutputFormat) || "original";
		const cropStrategy =
			(formData.get("cropStrategy") as "center" | "custom" | "person") ||
			"center";
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

				const metadata = await getImageMetadata(imageBuffer);

				const actualFormat: "jpeg" | "png" | "webp" =
					outputFormat === "original"
						? (metadata.format as "jpeg" | "png" | "webp")
						: outputFormat;

				const processingOptions =
					cropStrategy === "person"
						? {
							crop: {
								width: CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
								height: CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
								strategy: "person" as const,
							},
							resize: {
								width: CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
								height: CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
								fit: CONFIG.IMAGE_PROCESSING.RESIZE_FIT,
								quality: CONFIG.IMAGE_PROCESSING.QUALITY,
								format: actualFormat,
							},
						}
						: {
							resize: {
								width: CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
								height: CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
								fit: CONFIG.IMAGE_PROCESSING.RESIZE_FIT,
								quality: CONFIG.IMAGE_PROCESSING.QUALITY,
								format: actualFormat,
							},
						};

				const processedBuffer = await processImage(
					imageBuffer,
					processingOptions,
				);

				const processedFileName = file.name.replace(
					/\.[^/.]+$/,
					`.${actualFormat}`,
				);
				const r2Key = pathManager.getProcessedImagePath(
					sessionId,
					processedFileName,
				);

				await uploadToR2(r2Key, processedBuffer, `image/${actualFormat}`);

				return {
					session_id: sessionId,
					original_name: file.name,
					processed_name: processedFileName,
					processed_r2_key: r2Key,
					status: "completed" as ImageStatus,
				} as UploadedImageMetadata;
			}),
		);

		sessionCache.addImage(sessionId, results as UploadedImageMetadata[]);

		return {
			success: true,
			results,
		};
	} catch (error) {
		console.error("Processing error:", error);
		const sessionId = formData.get("sessionId") as string;
		const files = getFilesFromFormData(formData);

		sessionCache.addImage(
			sessionId,
			files.map(
				(file: File) =>
					({
						session_id: sessionId,
						original_name: file.name,
						processed_name: "",
						processed_r2_key: "",
						status: "error" as ImageStatus,
						error_message:
							error instanceof Error ? error.message : "Unknown error",
					}) as UploadedImageMetadata,
			),
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
	const metadata = sessionCache.getImages(sessionId);

	if (metadata.length === 0) return;

	await saveMultipleImageMetadata(
		metadata.map((image) => ({
			session_id: image.session_id,
			original_name: image.original_name,
			processed_name: image.processed_name,
			processed_r2_key: image.processed_r2_key,
			status: image.status,
			...(image.error_message && { error_message: image.error_message }),
		})),
	);

	sessionCache.clearImages(sessionId);
}
