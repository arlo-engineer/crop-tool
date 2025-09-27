export class R2PathManager {
	private env: "dev" | "prod";

	constructor() {
		this.env = process.env.APP_ENV === "production" ? "prod" : "dev";
	}

	getSessionPath(sessionId: string): string {
		return `${this.env}/sessions/${sessionId}`;
	}

	// getOriginalImagePath(sessionId: string, imageId: string, ext: string): string {
	//     return `${this.getSessionPath(sessionId)}/original/${imageId}.${ext}`;
	// }

	getProcessedImagePath(sessionId: string, fileName: string): string {
		return `${this.getSessionPath(sessionId)}/processed/${fileName}`;
	}
}
