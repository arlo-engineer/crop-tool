import sharp from "sharp";
import { CONFIG } from "@/lib/constants/config";
import type {
	CropOptions,
	ImageMetadata,
	ImageProcessingOptions,
	ResizeOptions,
} from "@/lib/types/imageProcessing";
import { detectPerson } from "./personDetector";

export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
	const metadata = await sharp(buffer).metadata();

	return {
		width: metadata.width || 0,
		height: metadata.height || 0,
		format: metadata.format || "unknown",
		channels: metadata.channels || 0,
		hasAlpha: metadata.hasAlpha || false,
	};
}

export async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
	try {
		const metadata = await sharp(buffer).metadata();
		return !!(metadata.width && metadata.height);
	} catch {
		return false;
	}
}

export async function resizeImage(
	buffer: Buffer,
	options: ResizeOptions,
): Promise<Buffer> {
	const {
		width,
		height,
		fit = CONFIG.IMAGE_PROCESSING.RESIZE_FIT,
		quality = CONFIG.IMAGE_PROCESSING.QUALITY,
		format = CONFIG.IMAGE_PROCESSING.FORMAT,
	} = options;

	let sharpInstance = sharp(buffer).resize(width, height, { fit });

	switch (format) {
		case "jpeg":
			sharpInstance = sharpInstance.jpeg({ quality });
			break;
		case "png":
			sharpInstance = sharpInstance.png({ quality });
			break;
		case "webp":
			sharpInstance = sharpInstance.webp({ quality });
			break;
	}

	return sharpInstance.toBuffer();
}

export async function cropImage(
	buffer: Buffer,
	options: CropOptions,
): Promise<Buffer> {
	const { width, height, left, top, strategy = "center" } = options;

	let sharpInstance = sharp(buffer);
	const metadata = await getImageMetadata(buffer);

	if (strategy === "person") {
		const personResult = await detectPerson(
			buffer,
			CONFIG.PERSON_DETECTION.MIN_SCORE,
		);

		if (personResult) {
			// Person detected - calculate crop area to maintain target aspect ratio
			const [x, y, personWidth, personHeight] = personResult.bbox;
			const personCenterX = x + personWidth / 2;
			const personCenterY = y + personHeight / 2;

			const targetAspectRatio = width / height;
			const imageAspectRatio = metadata.width / metadata.height;

			let cropWidth: number;
			let cropHeight: number;

			// Calculate crop dimensions to match target aspect ratio
			if (imageAspectRatio > targetAspectRatio) {
				// Image is wider - crop width
				cropHeight = metadata.height;
				cropWidth = Math.floor(cropHeight * targetAspectRatio);
			} else {
				// Image is taller - crop height
				cropWidth = metadata.width;
				cropHeight = Math.floor(cropWidth / targetAspectRatio);
			}

			// Center crop area on person
			let cropLeft = Math.floor(personCenterX - cropWidth / 2);
			let cropTop = Math.floor(personCenterY - cropHeight / 2);

			// Adjust if crop area exceeds image boundaries
			cropLeft = Math.max(0, Math.min(cropLeft, metadata.width - cropWidth));
			cropTop = Math.max(0, Math.min(cropTop, metadata.height - cropHeight));

			sharpInstance = sharpInstance.extract({
				left: cropLeft,
				top: cropTop,
				width: cropWidth,
				height: cropHeight,
			});
		} else {
			// No person detected - use center crop strategy as fallback
			console.log("No person detected, falling back to center crop");
			const targetAspectRatio = width / height;
			const imageAspectRatio = metadata.width / metadata.height;

			let cropWidth: number;
			let cropHeight: number;

			if (imageAspectRatio > targetAspectRatio) {
				cropHeight = metadata.height;
				cropWidth = Math.floor(cropHeight * targetAspectRatio);
			} else {
				cropWidth = metadata.width;
				cropHeight = Math.floor(cropWidth / targetAspectRatio);
			}

			const cropLeft = Math.max(0, Math.floor((metadata.width - cropWidth) / 2));
			const cropTop = Math.max(0, Math.floor((metadata.height - cropHeight) / 2));

			sharpInstance = sharpInstance.extract({
				left: cropLeft,
				top: cropTop,
				width: cropWidth,
				height: cropHeight,
			});
		}
	} else if (strategy === "center") {
		const cropLeft = Math.max(0, Math.floor((metadata.width - width) / 2));
		const cropTop = Math.max(0, Math.floor((metadata.height - height) / 2));

		sharpInstance = sharpInstance.extract({
			left: cropLeft,
			top: cropTop,
			width: Math.min(width, metadata.width),
			height: Math.min(height, metadata.height),
		});
	} else if (strategy === "custom" && left !== undefined && top !== undefined) {
		sharpInstance = sharpInstance.extract({
			left,
			top,
			width,
			height,
		});
	}

	return sharpInstance.toBuffer();
}

export async function processImage(
	buffer: Buffer,
	options: ImageProcessingOptions = {},
): Promise<Buffer> {
	let processedBuffer = buffer;

	if (options.crop) {
		processedBuffer = await cropImage(processedBuffer, options.crop);
	}

	if (options.resize) {
		processedBuffer = await resizeImage(processedBuffer, options.resize);
	}

	if (!options.crop && !options.resize) {
		processedBuffer = await resizeImage(processedBuffer, {
			width: CONFIG.IMAGE_PROCESSING.DEFAULT_WIDTH,
			height: CONFIG.IMAGE_PROCESSING.DEFAULT_HEIGHT,
			fit: CONFIG.IMAGE_PROCESSING.RESIZE_FIT,
			quality: CONFIG.IMAGE_PROCESSING.QUALITY,
			format: CONFIG.IMAGE_PROCESSING.FORMAT,
		});
	}

	return processedBuffer;
}
