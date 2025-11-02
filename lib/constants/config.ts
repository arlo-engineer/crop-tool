export const CONFIG = {
	APP_NAME: "Percen",
	CHUNK_SIZE: 3,
	MAX_FILES: 100,
	MAX_FILE_SIZE: 8 * 1024 * 1024, // 8MB
	ALLOWED_MIME_TYPES: [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	] as const,

	SIGNED_URL_EXPIRATION: 1 * 60 * 60, // 1 hour
	ZIP_DOWNLOAD_URL_EXPIRATION: 60 * 60 * 1000, // 1 hour

	IMAGE_PROCESSING: {
		DEFAULT_WIDTH: 640,
		DEFAULT_HEIGHT: 800,
		QUALITY: 85,
		FORMAT: "jpeg" as const,
		CROP_STRATEGY: "center" as const,
		RESIZE_FIT: "cover" as const,
		SUPPORTED_FORMATS: ["jpeg", "png", "webp"] as const,
	},

	PERSON_DETECTION: {
		MIN_SCORE: 0.5,
		TIMEOUT_MS: 10000,
		FALLBACK_FIT: "contain" as const,
	},

	IMAGE_SIZE_LIMITS: {
		MIN_WIDTH: 100,
		MAX_WIDTH: 4000,
		MIN_HEIGHT: 100,
		MAX_HEIGHT: 4000,
	},
} as const;
