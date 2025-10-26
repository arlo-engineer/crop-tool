import { CONFIG } from "./config";

export const TEXTS = {
	// Header
	APP_NAME: "ImageProcessor",
	NAV_QA: "QA",
	NAV_HELP: "Help",

	// Hero Section
	HERO_BADGE: "完全無料",
	HERO_TITLE: `${CONFIG.MAX_FILES}枚の写真を一気にリサイズ。人物は自動で中央配置`,
	HERO_SUBTITLE:
		"アップロードするだけで、AIが人物を検知。統一サイズの画像をZIPでダウンロード",

	// Upload Zone
	UPLOAD_TITLE: "ドラッグ&ドロップまたはクリックして画像を選択",
	UPLOAD_MAX_FILES: `最大${CONFIG.MAX_FILES}枚まで対応`,
	UPLOAD_SUPPORTED_FORMATS: "JPG, PNG対応",

	// Processing Controls
	IMAGE_COUNT_LABEL: "枚",
	OUTPUT_FORMAT_MESSAGE: "出力フォーマット",
	OUTPUT_FORMAT_ORIGINAL: "オリジナル",
	PROCESS_START_BUTTON: "一括加工開始",
	DOWNLOAD_ZIP_BUTTON: "Download ZIP",

	// Progress
	PROGRESS_PROCESSING: "処理中",
	PROGRESS_COMPLETED: "処理完了",

	// Messages
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

	SIZE_INPUT_WIDTH_LABEL: "幅 (px)",
	SIZE_INPUT_HEIGHT_LABEL: "高さ (px)",
	SIZE_VALIDATION_ERROR: `画像サイズは${CONFIG.IMAGE_SIZE_LIMITS.MIN_WIDTH}〜${CONFIG.IMAGE_SIZE_LIMITS.MAX_WIDTH}pxの範囲で指定してください`,
} as const;
