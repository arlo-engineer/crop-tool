export interface ImageMetadata {
	width: number;
	height: number;
	format: string;
	channels: number;
	hasAlpha: boolean;
}

export interface ResizeOptions {
	width: number;
	height: number;
	fit?: "cover" | "contain" | "fill" | "inside" | "outside";
	quality?: number;
	format?: "jpeg" | "png" | "webp";
}

export interface CropOptions {
	width: number;
	height: number;
	left?: number;
	top?: number;
	strategy?: "center" | "custom" | "person";
}

export interface ImageProcessingOptions {
	resize?: ResizeOptions;
	crop?: CropOptions;
	quality?: number;
	format?: "jpeg" | "png" | "webp";
}

export type OutputFormat = "jpeg" | "png" | "webp" | "original";
