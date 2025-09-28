"use client";

import JSZip from "jszip";
import { useState } from "react";
import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";

interface UseZipGenerationReturn {
	generateZip: (zipSource: ZipSource[]) => Promise<string>;
	isGenerating: boolean;
	error: string | null;
}

interface ZipSource {
	url: string;
	originalName: string;
}

export function useZipGeneration(): UseZipGenerationReturn {
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const generateZip = async (zipSource: ZipSource[]): Promise<string> => {
		try {
			setIsGenerating(true);
			setError(null);

			const filePromises = zipSource.map(async (source, _index) => {
				const response = await fetch(source.url);
				if (!response.ok) {
					throw new Error(`Failed to fetch file: ${response.statusText}`);
				}
				const blob = await response.blob();
				const fileName = source.originalName;
				return { fileName, blob };
			});

			const files = await Promise.all(filePromises);

			const zip = new JSZip();
			for (const { fileName, blob } of files) {
				zip.file(fileName, blob);
			}

			const zipBlob = await zip.generateAsync({ type: "blob" });
			const downloadUrl = URL.createObjectURL(zipBlob);

			setTimeout(() => {
				URL.revokeObjectURL(downloadUrl);
			}, CONFIG.ZIP_DOWNLOAD_URL_EXPIRATION);

			return downloadUrl;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : TEXTS.ZIP_GENERATION_ERROR_MESSAGE;
			setError(errorMessage);
			throw err;
		} finally {
			setIsGenerating(false);
		}
	};

	return {
		generateZip,
		isGenerating,
		error,
	};
}
