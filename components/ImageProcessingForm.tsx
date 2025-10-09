"use client";

import { useId, useState } from "react";
import { getMultipleSignedUrls } from "@/app/actions/download";
import { flushImagesToDB, processImages } from "@/app/actions/process";
import { useZipGeneration } from "@/hooks/useZipGeneration";
import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";
import type { OutputFormat } from "@/lib/types/imageProcessing";
import type { ProcessingResult, Result } from "@/lib/types/result";
import {
	createFixedChunks,
	createSmartChunks,
} from "@/lib/utils/chunkOptimizer";
import { downloadZipFile } from "@/lib/utils/downloadZipFile";

export default function ImageProcessingForm() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [zipUrl, setZipUrl] = useState<string | null>(null);
	const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
	const [cropStrategy, setCropStrategy] = useState<"center" | "person">(
		"center",
	);
	const { generateZip, isGenerating } = useZipGeneration();
	const outputFormatId = useId();
	const cropStrategyId = useId();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsProcessing(true);

		if (zipUrl) {
			URL.revokeObjectURL(zipUrl);
			setZipUrl(null);
		}

		const result = await processAndGenerateZip(
			event.currentTarget,
			generateZip,
			outputFormat,
			cropStrategy,
		);

		if (result.success) {
			setZipUrl(result.data);
			alert(TEXTS.COMPLETE_MESSAGE);
		} else {
			alert(result.error);
		}

		setIsProcessing(false);
	};

	const handleDownload = () => {
		if (!zipUrl) return;

		const fileName = `processed-images-${new Date().toISOString().split("T")[0]}.zip`;
		downloadZipFile(zipUrl, fileName);
	};

	return (
		<>
			<form onSubmit={handleSubmit}>
				<input
					type="file"
					name="files"
					multiple
					accept="image/*"
					disabled={isProcessing || isGenerating}
				/>
				<div>
					<label htmlFor={outputFormatId}>
						{TEXTS.OUTPUT_FORMAT_MESSAGE}:{" "}
					</label>
					<select
						id={outputFormatId}
						name="outputFormat"
						value={outputFormat}
						onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
						disabled={isProcessing || isGenerating}
					>
						<option value="original">{TEXTS.OUTPUT_FORMAT_ORIGINAL}</option>
						<option value="jpeg">JPEG</option>
						<option value="png">PNG</option>
						<option value="webp">WebP</option>
					</select>
				</div>
				<div>
					<label htmlFor={cropStrategyId}>クロップ戦略: </label>
					<select
						id={cropStrategyId}
						name="cropStrategy"
						value={cropStrategy}
						onChange={(e) =>
							setCropStrategy(e.target.value as "center" | "person")
						}
						disabled={isProcessing || isGenerating}
					>
						<option value="center">中央</option>
						<option value="person">人物検知</option>
					</select>
				</div>
				<button type="submit" disabled={isProcessing || isGenerating}>
					{isProcessing || isGenerating
						? TEXTS.PROCESSING
						: TEXTS.PROCESS_START}
				</button>
			</form>
			{zipUrl && (
				<button type="button" onClick={handleDownload}>
					Download ZIP
				</button>
			)}
		</>
	);
}

async function processAndGenerateZip(
	form: HTMLFormElement,
	generateZip: (
		sources: Array<{ url: string; processedName: string }>,
	) => Promise<string>,
	outputFormat: OutputFormat,
	cropStrategy: "center" | "person",
): Promise<ProcessingResult> {
	const sessionId = crypto.randomUUID();

	try {
		const filesResult = extractAndValidateFiles(form);
		if (!filesResult.success) {
			return filesResult;
		}

		await processImagesInChunks(
			filesResult.data,
			sessionId,
			outputFormat,
			cropStrategy,
		);

		await flushImagesToDB(sessionId);

		const urls = await getMultipleSignedUrls(sessionId);

		const zipUrl = await generateZip(urls);

		return { success: true, data: zipUrl };
	} catch (error) {
		return {
			success: false,
			error: getErrorMessage(error),
		};
	}
}

function extractAndValidateFiles(form: HTMLFormElement): Result<File[]> {
	const formData = new FormData(form);
	const allFiles = formData.getAll("files") as File[];
	const files = allFiles.filter((file) => file.size > 0 && file.name !== "");

	if (files.length === 0) {
		return { success: false, error: TEXTS.SELECT_FILES_MESSAGE };
	}

	if (files.length > CONFIG.MAX_FILES) {
		return { success: false, error: TEXTS.MAX_FILES_MESSAGE };
	}

	const oversizedFile = files.find((file) => file.size > CONFIG.MAX_FILE_SIZE);
	if (oversizedFile) {
		return { success: false, error: TEXTS.MAX_FILE_SIZE_MESSAGE };
	}

	const invalidTypeFile = files.find(
		(file) =>
			!CONFIG.ALLOWED_MIME_TYPES.includes(
				file.type as (typeof CONFIG.ALLOWED_MIME_TYPES)[number],
			),
	);
	if (invalidTypeFile) {
		return {
			success: false,
			error: `${TEXTS.INVALID_FILE_TYPE_MESSAGE}\n(${invalidTypeFile.name})`,
		};
	}

	return { success: true, data: files };
}

async function processImagesInChunks(
	files: File[],
	sessionId: string,
	outputFormat: OutputFormat,
	cropStrategy: "center" | "person",
): Promise<void> {
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
		chunkFormData.append("outputFormat", outputFormat);
		chunkFormData.append("cropStrategy", cropStrategy);

		chunk.forEach((file, index) => {
			chunkFormData.append(`file-${index}`, file);
		});

		await processImages(chunkFormData);
	}
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const lowerMessage = error.message.toLowerCase();
		if (lowerMessage.includes("zip")) {
			return TEXTS.ZIP_GENERATION_ERROR_MESSAGE;
		}
		if (lowerMessage.includes("fetch")) {
			return TEXTS.FETCH_FILE_ERROR_MESSAGE;
		}
		if (
			lowerMessage.includes("supabase") ||
			lowerMessage.includes("database")
		) {
			return TEXTS.DATABASE_ERROR_MESSAGE;
		}
	}
	return TEXTS.ERROR_MESSAGE;
}
