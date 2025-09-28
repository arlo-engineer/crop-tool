export const CONFIG = {
	CHUNK_SIZE: 1,
	MAX_FILES: 100,
	MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
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
} as const;
