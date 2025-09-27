"use client";

import { useState } from "react";
import { flushImagesToDB, processImages } from "@/app/actions/process";
import { TEXTS } from "@/lib/constants/text";

export default function ImageProcessingForm() {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsProcessing(true);

		const formData = new FormData(event.currentTarget);
		const allFiles = formData.getAll("files") as File[];

		const files = allFiles.filter((file) => file.size > 0 && file.name !== "");

		if (files.length === 0) {
			alert(TEXTS.SELECT_FILES_MESSAGE);
			setIsProcessing(false);
			return;
		}

		const CHUNK_SIZE = 2;
		const sessionId = crypto.randomUUID();

		try {
			for (let i = 0; i < files.length; i += CHUNK_SIZE) {
				const chunk = files.slice(i, i + CHUNK_SIZE);
				const chunkFormData = new FormData();

				chunkFormData.append("sessionId", sessionId);

				chunk.forEach((file, index) => {
					chunkFormData.append(`file-${index}`, file);
				});

				await processImages(chunkFormData);
				console.log(`${i + CHUNK_SIZE} / ${files.length}`);
			}

			alert(TEXTS.COMPLETE_MESSAGE);
		} catch (error) {
			console.error("Error:", error);
			alert(TEXTS.ERROR_MESSAGE);
		} finally {
			await flushImagesToDB(sessionId);
			setIsProcessing(false);
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
