"use client";

import { useState } from "react";
import { getMultipleSignedUrls } from "@/app/actions/download";
import { flushImagesToDB, processImages } from "@/app/actions/process";
import Header from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import ImageGrid from "@/app/components/ImageGrid";
import ImageUploadZone from "@/app/components/ImageUploadZone";
import ProcessingControls from "@/app/components/ProcessingControls";
import ProgressBar from "@/app/components/ProgressBar";
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
import { createThumbnail } from "@/lib/utils/thumbnailGenerator";

interface ImageItem {
	id: string;
	fileName: string;
	previewUrl: string | null;
	status: "loading" | "pending" | "processing" | "completed" | "error";
	file: File;
}

export default function ImageProcessingForm() {
	const [images, setImages] = useState<ImageItem[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [processedCount, setProcessedCount] = useState(0);
	const [zipUrl, setZipUrl] = useState<string | null>(null);
	const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
	const [width, setWidth] = useState<number>(
		CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
	);
	const [height, setHeight] = useState<number>(
		CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
	);
	const { generateZip, isGenerating } = useZipGeneration();

	const handleFilesSelected = async (files: File[]) => {
		const placeholderImages: ImageItem[] = files.map((file) => ({
			id: crypto.randomUUID(),
			fileName: file.name,
			previewUrl: null,
			status: "loading" as const,
			file,
		}));

		setImages((prev) => [...prev, ...placeholderImages]);

		placeholderImages.forEach(async (placeholderImage, index) => {
			try {
				const thumbnailUrl = await createThumbnail(files[index]);

				setImages((prev) =>
					prev.map((img) =>
						img.id === placeholderImage.id
							? { ...img, previewUrl: thumbnailUrl, status: "pending" as const }
							: img,
					),
				);
			} catch (error) {
				console.error(
					`Failed to generate thumbnail for ${placeholderImage.fileName}:`,
					error,
				);
			}
		});
	};

	const handleProcessStart = async () => {
		if (images.length === 0) {
			alert(TEXTS.SELECT_FILES_MESSAGE);
			return;
		}

		setIsProcessing(true);
		setProcessedCount(0);

		if (zipUrl) {
			URL.revokeObjectURL(zipUrl);
			setZipUrl(null);
		}

		setImages((prev) =>
			prev.map((img) => ({ ...img, status: "processing" as const })),
		);

		const result = await processImagesAndGenerateZip(
			images.map((img) => img.file),
			generateZip,
			outputFormat,
			width,
			height,
			(processed) => {
				setProcessedCount(processed);
				setImages((prev) =>
					prev.map((img, index) =>
						index < processed ? { ...img, status: "completed" as const } : img,
					),
				);
			},
		);

		if (result.success) {
			setZipUrl(result.data);
			setImages((prev) =>
				prev.map((img) => ({ ...img, status: "completed" as const })),
			);
		} else {
			alert(result.error);
			setImages((prev) =>
				prev.map((img) => ({ ...img, status: "error" as const })),
			);
		}

		setIsProcessing(false);
	};

	const handleDownload = () => {
		if (!zipUrl) return;

		const fileName = `processed-images-${new Date().toISOString().split("T")[0]}.zip`;
		downloadZipFile(zipUrl, fileName);
	};

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden p-4 sm:p-6 md:p-8">
			<Header />
			<HeroSection />
			<div className="layout-container flex h-full w-full max-w-5xl grow flex-col gap-8">
				<ImageUploadZone
					onFilesSelected={handleFilesSelected}
					disabled={isProcessing || isGenerating}
				/>

				{images.length > 0 && (
					<>
						<ProcessingControls
							imageCount={images.length}
							maxCount={CONFIG.MAX_FILES}
							width={width}
							height={height}
							outputFormat={outputFormat}
							onWidthChange={setWidth}
							onHeightChange={setHeight}
							onFormatChange={setOutputFormat}
							onProcessStart={handleProcessStart}
							onDownload={handleDownload}
							isProcessing={isProcessing}
							canDownload={!!zipUrl}
							disabled={isGenerating}
						/>

						{isProcessing && (
							<ProgressBar
								current={processedCount}
								total={images.length}
								isCompleted={processedCount === images.length}
							/>
						)}

						<ImageGrid images={images} />
					</>
				)}
			</div>
		</div>
	);
}

async function processImagesAndGenerateZip(
	files: File[],
	generateZip: (
		sources: Array<{ url: string; processedName: string }>,
	) => Promise<string>,
	outputFormat: OutputFormat,
	width: number,
	height: number,
	onProgress?: (processedCount: number) => void,
): Promise<ProcessingResult> {
	const sessionId = crypto.randomUUID();

	try {
		if (files.length === 0) {
			return { success: false, error: TEXTS.SELECT_FILES_MESSAGE };
		}

		await processImagesInChunks(
			files,
			sessionId,
			outputFormat,
			width,
			height,
			onProgress,
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

async function processImagesInChunks(
	files: File[],
	sessionId: string,
	outputFormat: OutputFormat,
	width: number,
	height: number,
	onProgress?: (processedCount: number) => void,
): Promise<void> {
	let chunks: File[][];

	try {
		chunks = createSmartChunks(files);
	} catch (error) {
		console.warn("Falling back to fixed chunks:", error);
		chunks = createFixedChunks(files, CONFIG.CHUNK_SIZE);
	}

	let processedCount = 0;

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

		processedCount += chunk.length;
		if (onProgress) {
			onProgress(processedCount);
		}
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
