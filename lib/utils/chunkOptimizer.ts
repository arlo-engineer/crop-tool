import { CONFIG } from "@/lib/constants/config";

export function createSmartChunks(files: File[]): File[][] {
	const chunks: File[][] = [];

	if (files.length === 0) {
		return chunks;
	}

	const sortedFiles = [...files].sort((a, b) => b.size - a.size);

	for (const file of sortedFiles) {
		let placed = false;

		for (const chunk of chunks) {
			const chunkSize = chunk.reduce((sum, f) => sum + f.size, 0);
			if (chunkSize + file.size <= CONFIG.MAX_FILE_SIZE) {
				chunk.push(file);
				placed = true;
				break;
			}
		}

		if (!placed) {
			chunks.push([file]);
		}
	}

	return chunks;
}

export function createFixedChunks(files: File[], chunkSize: number = CONFIG.CHUNK_SIZE): File[][] {
	const chunks: File[][] = [];

	for (let i = 0; i < files.length; i += chunkSize) {
		chunks.push(files.slice(i, i + chunkSize));
	}

	return chunks;
}