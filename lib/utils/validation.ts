import { CONFIG } from "@/lib/constants/config";

/**
 * Validates if a value is within the specified range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns true if value is within range, false otherwise
 */
export function isValidSize(value: number, min: number, max: number): boolean {
	return !Number.isNaN(value) && value >= min && value <= max;
}

/**
 * Validates and parses image dimensions from FormData
 * @param formData - The FormData containing width and height
 * @returns Validated width and height, or throws an error if invalid
 * @throws Error if dimensions are invalid
 */
export function validateAndParseImageDimensions(formData: FormData): {
	width: number;
	height: number;
} {
	const widthStr = formData.get("width") as string;
	const heightStr = formData.get("height") as string;

	const width = Number.parseInt(widthStr, 10);
	const height = Number.parseInt(heightStr, 10);

	// Check if parsing was successful
	if (Number.isNaN(width) || Number.isNaN(height)) {
		throw new Error(
			"Invalid image dimensions: width and height must be valid numbers",
		);
	}

	// Validate width
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

	// Validate height
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

/**
 * Validates and parses image dimensions with fallback to default values
 * @param formData - The FormData containing width and height
 * @returns Validated width and height, or default values if not provided
 */
export function validateAndParseImageDimensionsWithFallback(
	formData: FormData,
): {
	width: number;
	height: number;
} {
	const widthStr = formData.get("width") as string;
	const heightStr = formData.get("height") as string;

	// If not provided, use default values
	if (!widthStr || !heightStr) {
		return {
			width: CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
			height: CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
		};
	}

	// Use strict validation if values are provided
	return validateAndParseImageDimensions(formData);
}
