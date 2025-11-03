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

function calculateCropDimensions(
	imageWidth: number,
	imageHeight: number,
	targetWidth: number,
	targetHeight: number,
): { cropWidth: number; cropHeight: number } {
	const targetAspectRatio = targetWidth / targetHeight;
	const imageAspectRatio = imageWidth / imageHeight;

	let cropWidth: number;
	let cropHeight: number;

	if (imageAspectRatio > targetAspectRatio) {
		cropHeight = imageHeight;
		cropWidth = Math.floor(cropHeight * targetAspectRatio);
	} else {
		cropWidth = imageWidth;
		cropHeight = Math.floor(cropWidth / targetAspectRatio);
	}

	cropWidth = Math.min(cropWidth, imageWidth);
	cropHeight = Math.min(cropHeight, imageHeight);

	return { cropWidth, cropHeight };
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

	let sharpInstance = sharp(buffer).rotate().resize(width, height, { fit });

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
	const { width, height } = options;

	const rotatedBuffer = await sharp(buffer).rotate().toBuffer();
	let sharpInstance = sharp(rotatedBuffer);
	const metadata = await getImageMetadata(rotatedBuffer);

	const personResult = await detectPerson(
		rotatedBuffer,
		CONFIG.PERSON_DETECTION.MIN_SCORE,
	);

	const { cropWidth, cropHeight } = calculateCropDimensions(
		metadata.width,
		metadata.height,
		width,
		height,
	);

	if (personResult) {
		const [x, y, personWidth, personHeight] = personResult.bbox;
		const personCenterX = x + personWidth / 2;
		const personCenterY = y + personHeight / 2;

		let cropLeft = Math.floor(personCenterX - cropWidth / 2);
		let cropTop = Math.floor(personCenterY - cropHeight / 2);

		cropLeft = Math.max(0, Math.min(cropLeft, metadata.width - cropWidth));
		cropTop = Math.max(0, Math.min(cropTop, metadata.height - cropHeight));

		sharpInstance = sharpInstance.extract({
			left: cropLeft,
			top: cropTop,
			width: cropWidth,
			height: cropHeight,
		});
	} else {
		console.warn("No person detected, falling back to center crop");

		const cropLeft = Math.max(0, Math.floor((metadata.width - cropWidth) / 2));
		const cropTop = Math.max(0, Math.floor((metadata.height - cropHeight) / 2));

		sharpInstance = sharpInstance.extract({
			left: cropLeft,
			top: cropTop,
			width: cropWidth,
			height: cropHeight,
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
