import { CONFIG } from "./config";

export const TEXTS = {
	COMPLETE_MESSAGE: "すべての画像の処理が完了しました",
	ERROR_MESSAGE: "処理中にエラーが発生しました",

	PROCESSING: "処理中...",
	PROCESS_START: "処理開始",

	SELECT_FILES_MESSAGE: "ファイルを選択してください",
	MAX_FILES_MESSAGE: `最大${CONFIG.MAX_FILES}枚まで選択可能です`,
	MAX_FILE_SIZE_MESSAGE: `最大${CONFIG.MAX_FILE_SIZE / 1024 / 1024} MBまで選択可能です`,
	INVALID_FILE_TYPE_MESSAGE:
		"サポートされていないファイル形式です。JPEG, PNG, GIF, WebP, SVG形式のみ対応しています",
	ZIP_GENERATION_ERROR_MESSAGE: "ZIP生成に失敗しました",
	FETCH_FILE_ERROR_MESSAGE: "ファイルの取得に失敗しました",
	DATABASE_ERROR_MESSAGE: "データベースへの保存に失敗しました",
	DOWNLOAD_EXPIRED_MESSAGE:
		"ダウンロードの有効期限が切れました。再度処理を実行してください。",
	IMAGE_PROCESSING_ERROR_MESSAGE: "画像の処理に失敗しました",
	INVALID_IMAGE_BUFFER_MESSAGE: "無効な画像データです",
	IMAGE_RESIZE_ERROR_MESSAGE: "画像のリサイズに失敗しました",
	IMAGE_CROP_ERROR_MESSAGE: "画像の切り抜きに失敗しました",
} as const;
