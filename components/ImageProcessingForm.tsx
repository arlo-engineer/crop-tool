"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { getMultipleSignedUrls } from "@/app/actions/download";
import { flushImagesToDB, processImages } from "@/app/actions/process";
import { useZipGeneration } from "@/hooks/useZipGeneration";
import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";
import type { OutputFormat } from "@/lib/types/imageProcessing";
import type { ProcessingResult } from "@/lib/types/result";
import {
	createFixedChunks,
	createSmartChunks,
} from "@/lib/utils/chunkOptimizer";
import { downloadZipFile } from "@/lib/utils/downloadZipFile";

export default function ImageProcessingForm() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [zipUrl, setZipUrl] = useState<string | null>(null);
	const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
	const [width, setWidth] = useState<number>(
		CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
	);
	const [height, setHeight] = useState<number>(
		CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
	);
	const { generateZip, isGenerating } = useZipGeneration();
	const outputFormatId = useId();
	const widthInputId = useId();
	const heightInputId = useId();

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
			width,
			height,
		);

		if (result.success) {
			setZipUrl(result.data);
			// alert(TEXTS.COMPLETE_MESSAGE);
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
			{!zipUrl && (
				<Image className="mt-5" src="/character-1.png" alt="test" width={600} height={600} />
			)}
			{zipUrl && (
				<Image src="/character-2.png" alt="test" width={624} height={624} />
			)}

			<form onSubmit={handleSubmit}>
				<input
					type="file"
					name="files"
					multiple
					accept="image/*"
					disabled={isProcessing || isGenerating}
				/>
				<div>
					<label htmlFor={widthInputId}>{TEXTS.SIZE_INPUT_WIDTH_LABEL}: </label>
					<input
						id={widthInputId}
						type="number"
						name="width"
						value={width}
						onChange={(e) => setWidth(Number(e.target.value))}
						min={CONFIG.IMAGE_SIZE_LIMITS.MIN_WIDTH}
						max={CONFIG.IMAGE_SIZE_LIMITS.MAX_WIDTH}
						disabled={isProcessing || isGenerating}
					/>
				</div>
				<div>
					<label htmlFor={heightInputId}>
						{TEXTS.SIZE_INPUT_HEIGHT_LABEL}:{" "}
					</label>
					<input
						id={heightInputId}
						type="number"
						name="height"
						value={height}
						onChange={(e) => setHeight(Number(e.target.value))}
						min={CONFIG.IMAGE_SIZE_LIMITS.MIN_HEIGHT}
						max={CONFIG.IMAGE_SIZE_LIMITS.MAX_HEIGHT}
						disabled={isProcessing || isGenerating}
					/>
				</div>
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
	width: number,
	height: number,
): Promise<ProcessingResult> {
	const sessionId = crypto.randomUUID();

	try {
		const formData = new FormData(form);
		const allFiles = formData.getAll("files") as File[];
		const files = allFiles.filter((file) => file.size > 0 && file.name !== "");

		if (files.length === 0) {
			return { success: false, error: TEXTS.SELECT_FILES_MESSAGE };
		}

		await processImagesInChunks(files, sessionId, outputFormat, width, height);

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

async function processImagesInChunks(
	files: File[],
	sessionId: string,
	outputFormat: OutputFormat,
	width: number,
	height: number,
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
		chunkFormData.append("width", width.toString());
		chunkFormData.append("height", height.toString());

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
