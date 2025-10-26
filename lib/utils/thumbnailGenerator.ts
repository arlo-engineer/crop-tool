const THUMBNAIL_SIZE = 200;
const THUMBNAIL_QUALITY = 0.7;

export async function createThumbnail(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);

		img.onload = () => {
			try {
				const { width, height } = calculateThumbnailDimensions(
					img.width,
					img.height,
				);

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					throw new Error("Failed to get canvas context");
				}

				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "high";
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						URL.revokeObjectURL(objectUrl);

						if (!blob) {
							reject(new Error("Failed to create thumbnail blob"));
							return;
						}

						const thumbnailUrl = URL.createObjectURL(blob);
						resolve(thumbnailUrl);
					},
					"image/jpeg",
					THUMBNAIL_QUALITY,
				);
			} catch (error) {
				URL.revokeObjectURL(objectUrl);
				reject(error);
			}
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error(`Failed to load image: ${file.name}`));
		};

		img.src = objectUrl;
	});
}

function calculateThumbnailDimensions(
	originalWidth: number,
	originalHeight: number,
): { width: number; height: number } {
	let width = originalWidth;
	let height = originalHeight;

	if (width > THUMBNAIL_SIZE || height > THUMBNAIL_SIZE) {
		const aspectRatio = width / height;

		if (width > height) {
			width = THUMBNAIL_SIZE;
			height = Math.round(THUMBNAIL_SIZE / aspectRatio);
		} else {
			height = THUMBNAIL_SIZE;
			width = Math.round(THUMBNAIL_SIZE * aspectRatio);
		}
	}

	return { width, height };
}

export async function createThumbnails(files: File[]): Promise<string[]> {
	return Promise.all(files.map((file) => createThumbnail(file)));
}
