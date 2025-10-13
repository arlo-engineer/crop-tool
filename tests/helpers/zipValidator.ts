import JSZip from "jszip";
import sharp from "sharp";
import { detectPerson } from "@/lib/utils/personDetector";

export interface ImageValidationResult {
	filename: string;
	width: number;
	height: number;
	isPersonCentered?: boolean;
	personDetected?: boolean;
}

/**
 * Extract ZIP file and return image buffers with metadata
 */
export async function extractZipImages(
	zipBuffer: Buffer,
): Promise<Map<string, Buffer>> {
	const zip = await JSZip.loadAsync(zipBuffer);
	const images = new Map<string, Buffer>();

	for (const [filename, file] of Object.entries(zip.files)) {
		if (!file.dir && isImageFile(filename)) {
			const buffer = await file.async("nodebuffer");
			images.set(filename, buffer);
		}
	}

	return images;
}

/**
 * Validate image size
 */
export async function validateImageSize(
	imageBuffer: Buffer,
	expectedWidth: number,
	expectedHeight: number,
): Promise<{ width: number; height: number; isValid: boolean }> {
	const metadata = await sharp(imageBuffer).metadata();
	const width = metadata.width || 0;
	const height = metadata.height || 0;
	const isValid = width === expectedWidth && height === expectedHeight;

	return { width, height, isValid };
}

/**
 * Validate person centered in image
 * Checks if detected person is near the center of the image
 */
export async function validatePersonCentered(
	imageBuffer: Buffer,
	toleranceRatio = 0.2,
): Promise<{
	personDetected: boolean;
	isPersonCentered: boolean;
	distance?: number;
}> {
	const metadata = await sharp(imageBuffer).metadata();
	const imageWidth = metadata.width;
	const imageHeight = metadata.height;

	const imageCenterX = imageWidth / 2;
	const imageCenterY = imageHeight / 2;

	// Detect person
	const detection = await detectPerson(imageBuffer, 0.5);

	if (!detection) {
		return { personDetected: false, isPersonCentered: false };
	}

	// Calculate person center from bounding box
	const [x, y, width, height] = detection.bbox;
	const personCenterX = x + width / 2;
	const personCenterY = y + height / 2;

	// Calculate distance from image center
	const distanceX = Math.abs(personCenterX - imageCenterX);
	const distanceY = Math.abs(personCenterY - imageCenterY);

	// Calculate tolerance
	const toleranceX = imageWidth * toleranceRatio;
	const toleranceY = imageHeight * toleranceRatio;

	// Check if person is centered
	const isPersonCentered = distanceX <= toleranceX && distanceY <= toleranceY;

	// Calculate normalized distance (0-1)
	const normalizedDistance =
		Math.sqrt((distanceX / imageWidth) ** 2 + (distanceY / imageHeight) ** 2) *
		100;

	return {
		personDetected: true,
		isPersonCentered,
		distance: Math.round(normalizedDistance),
	};
}

/**
 * Validate all images in ZIP
 */
export async function validateZipImages(
	zipBuffer: Buffer,
	expectedWidth: number,
	expectedHeight: number,
	checkPersonCentered = false,
): Promise<ImageValidationResult[]> {
	const images = await extractZipImages(zipBuffer);
	const results: ImageValidationResult[] = [];

	for (const [filename, buffer] of images.entries()) {
		const sizeResult = await validateImageSize(
			buffer,
			expectedWidth,
			expectedHeight,
		);

		const result: ImageValidationResult = {
			filename,
			width: sizeResult.width,
			height: sizeResult.height,
		};

		if (checkPersonCentered) {
			const personResult = await validatePersonCentered(buffer);
			result.personDetected = personResult.personDetected;
			result.isPersonCentered = personResult.isPersonCentered;
		}

		results.push(result);
	}

	return results;
}

/**
 * Check if filename is an image file
 */
function isImageFile(filename: string): boolean {
	const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
	const lowerFilename = filename.toLowerCase();
	return imageExtensions.some((ext) => lowerFilename.endsWith(ext));
}
