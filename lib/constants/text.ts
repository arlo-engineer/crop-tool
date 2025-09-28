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
} as const;
