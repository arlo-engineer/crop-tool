"use client";

import { useState } from "react";
import { getMultipleSignedUrls } from "@/app/actions/download";
import { flushImagesToDB, processImages } from "@/app/actions/process";
import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";
import {
	createFixedChunks,
	createSmartChunks,
} from "@/lib/utils/chunkOptimizer";

export default function ImageProcessingForm() {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsProcessing(true);

		const formData = new FormData(event.currentTarget);
		const allFiles = formData.getAll("files") as File[];

		const files = allFiles.filter((file) => file.size > 0 && file.name !== "");

		if (!validateFiles(files, setIsProcessing)) {
			return;
		}

		const sessionId = crypto.randomUUID();

		try {
			let chunks: File[][];
			try {
				chunks = createSmartChunks(files);
			} catch (error) {
				console.warn("Falling back to fixed chunks:", error);
				chunks = createFixedChunks(files, CONFIG.CHUNK_SIZE);
			}

			for (let i = 0; i < chunks.length; i++) {
				const chunk = chunks[i];
				const chunkFormData = new FormData();

				chunkFormData.append("sessionId", sessionId);

				chunk.forEach((file, index) => {
					chunkFormData.append(`file-${index}`, file);
				});

				await processImages(chunkFormData);
			}

			alert(TEXTS.COMPLETE_MESSAGE);
		} catch (error) {
			console.error("Error:", error);
			alert(TEXTS.ERROR_MESSAGE);
		} finally {
			await flushImagesToDB(sessionId);
			setIsProcessing(false);

			const urls = await getMultipleSignedUrls(sessionId);
			console.log(urls);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="file"
				name="files"
				multiple
				accept="image/*"
				disabled={isProcessing}
			/>
			<button type="submit" disabled={isProcessing}>
				{isProcessing ? TEXTS.PROCESSING : TEXTS.PROCESS_START}
			</button>
		</form>
	);
}

const validateFiles = (
	files: File[],
	setIsProcessing: (isProcessing: boolean) => void,
) => {
	if (files.length === 0) {
		alert(TEXTS.SELECT_FILES_MESSAGE);
		setIsProcessing(false);
		return false;
	}

	if (files.length > CONFIG.MAX_FILES) {
		alert(TEXTS.MAX_FILES_MESSAGE);
		setIsProcessing(false);
		return false;
	}

	const oversizedFile = files.find((file) => file.size > CONFIG.MAX_FILE_SIZE);
	if (oversizedFile) {
		alert(TEXTS.MAX_FILE_SIZE_MESSAGE);
		setIsProcessing(false);
		return false;
	}

	const invalidTypeFile = files.find(
		(file) =>
			!CONFIG.ALLOWED_MIME_TYPES.includes(
				file.type as (typeof CONFIG.ALLOWED_MIME_TYPES)[number],
			),
	);
	if (invalidTypeFile) {
		alert(`${TEXTS.INVALID_FILE_TYPE_MESSAGE}\n(${invalidTypeFile.name})`);
		setIsProcessing(false);
		return false;
	}

	return true;
};
