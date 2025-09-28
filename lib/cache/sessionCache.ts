import type { UploadedImageMetadata } from "../types/database";

const store = new Map<string, UploadedImageMetadata[]>();

export const sessionCache = {
	addImage(sessionId: string, metadata: UploadedImageMetadata[]): void {
		const existing = store.get(sessionId) || [];
		store.set(sessionId, [...existing, ...metadata]);
	},

	getImages(sessionId: string): UploadedImageMetadata[] {
		return store.get(sessionId) || [];
	},

	clearImages(sessionId: string): void {
		store.delete(sessionId);
	},
};
