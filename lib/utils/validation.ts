import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";

export function isValidSize(value: number, min: number, max: number): boolean {
	return !Number.isNaN(value) && value >= min && value <= max;
}

export function validateFiles(files: File[]): void {
	if (files.length === 0) {
		throw new Error(TEXTS.SELECT_FILES_MESSAGE);
	}

	if (files.length > CONFIG.MAX_FILES) {
		throw new Error(
			`${TEXTS.MAX_FILES_MESSAGE} (Selected: ${files.length} files)`,
		);
	}

	const oversizedFile = files.find((file) => file.size > CONFIG.MAX_FILE_SIZE);
	if (oversizedFile) {
		const fileSizeMB = (oversizedFile.size / 1024 / 1024).toFixed(2);
		const maxSizeMB = (CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
		throw new Error(
			`${TEXTS.MAX_FILE_SIZE_MESSAGE}\nFile: ${oversizedFile.name} (${fileSizeMB}MB > ${maxSizeMB}MB)`,
		);
	}

	for (const file of files) {
		if (
			!CONFIG.ALLOWED_MIME_TYPES.includes(
				file.type as (typeof CONFIG.ALLOWED_MIME_TYPES)[number],
			)
		) {
			throw new Error(
				`${TEXTS.INVALID_FILE_TYPE_MESSAGE}\nFile: ${file.name} (Type: ${file.type || "unknown"})`,
			);
		}
	}
}

export function validateAndParseImageDimensions(formData: FormData): {
	width: number;
	height: number;
} {
	const widthStr = formData.get("width") as string;
	const heightStr = formData.get("height") as string;

	const width = Number.parseInt(widthStr, 10);
	const height = Number.parseInt(heightStr, 10);

	if (Number.isNaN(width) || Number.isNaN(height)) {
		throw new Error(
			"Invalid image dimensions: width and height must be valid numbers",
		);
	}

	if (
		!isValidSize(
			width,
			CONFIG.IMAGE_SIZE_LIMITS.MIN_WIDTH,
			CONFIG.IMAGE_SIZE_LIMITS.MAX_WIDTH,
		)
	) {
		throw new Error(
			`Invalid width: must be between ${CONFIG.IMAGE_SIZE_LIMITS.MIN_WIDTH} and ${CONFIG.IMAGE_SIZE_LIMITS.MAX_WIDTH} pixels (received: ${width})`,
		);
	}

	if (
		!isValidSize(
			height,
			CONFIG.IMAGE_SIZE_LIMITS.MIN_HEIGHT,
			CONFIG.IMAGE_SIZE_LIMITS.MAX_HEIGHT,
		)
	) {
		throw new Error(
			`Invalid height: must be between ${CONFIG.IMAGE_SIZE_LIMITS.MIN_HEIGHT} and ${CONFIG.IMAGE_SIZE_LIMITS.MAX_HEIGHT} pixels (received: ${height})`,
		);
	}

	return { width, height };
}

export function validateAndParseImageDimensionsWithFallback(
	formData: FormData,
): {
	width: number;
	height: number;
} {
	const widthStr = formData.get("width") as string;
	const heightStr = formData.get("height") as string;

	if (!widthStr || !heightStr) {
		return {
			width: CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
			height: CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
		};
	}

	return validateAndParseImageDimensions(formData);
}
