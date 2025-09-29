import sharp from "sharp";
import { CONFIG } from "@/lib/constants/config";
import type {
	CropOptions,
	ImageMetadata,
	ImageProcessingOptions,
	ResizeOptions,
} from "@/lib/types/imageProcessing";

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

	if (strategy === "center") {
		const metadata = await getImageMetadata(buffer);
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
