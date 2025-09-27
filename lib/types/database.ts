export type ImageStatus = "processing" | "completed" | "error";

export interface UploadedImageMetadata {
	session_id: string;
	original_name: string;
	processed_r2_key: string;
	status: ImageStatus;
	error_message?: string;
}
