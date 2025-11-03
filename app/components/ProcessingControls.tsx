"use client";

import { CONFIG } from "@/lib/constants/config";
import { TEXTS } from "@/lib/constants/text";
import type { OutputFormat } from "@/lib/types/imageProcessing";

interface ProcessingControlsProps {
	imageCount: number;
	maxCount: number;
	width: number;
	height: number;
	outputFormat: OutputFormat;
	onWidthChange: (value: number) => void;
	onHeightChange: (value: number) => void;
	onFormatChange: (value: OutputFormat) => void;
	onProcessStart: () => void;
	onDownload: () => void;
	isProcessing: boolean;
	canDownload: boolean;
	disabled?: boolean;
}

export default function ProcessingControls({
	imageCount,
	maxCount,
	width,
	height,
	outputFormat,
	onWidthChange,
	onHeightChange,
	onFormatChange,
	onProcessStart,
	onDownload,
	isProcessing,
	canDownload,
	disabled = false,
}: ProcessingControlsProps) {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
				<h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
					{imageCount} / {maxCount}
					{TEXTS.IMAGE_COUNT_LABEL}
				</h2>
				<div className="flex flex-col sm:flex-row items-center gap-4">
					<div className="flex items-center gap-2">
						<input
							className="w-28 text-sm text-center rounded-lg border border-border bg-background focus:ring-primary focus:border-primary px-3 py-2"
							type="number"
							value={width}
							onChange={(e) => onWidthChange(Number(e.target.value))}
							min={CONFIG.IMAGE_SIZE_LIMITS.MIN_WIDTH}
							max={CONFIG.IMAGE_SIZE_LIMITS.MAX_WIDTH}
							disabled={disabled || isProcessing}
						/>
						<span className="text-text-secondary">x</span>
						<input
							className="w-28 text-sm text-center rounded-lg border border-border bg-background focus:ring-primary focus:border-primary px-3 py-2"
							type="number"
							value={height}
							onChange={(e) => onHeightChange(Number(e.target.value))}
							min={CONFIG.IMAGE_SIZE_LIMITS.MIN_HEIGHT}
							max={CONFIG.IMAGE_SIZE_LIMITS.MAX_HEIGHT}
							disabled={disabled || isProcessing}
						/>
					</div>
					<div className="flex items-center">
						<select
							className="w-40 text-sm text-center rounded-lg border border-border bg-background focus:ring-primary focus:border-primary text-text-primary px-3 py-2"
							value={outputFormat}
							onChange={(e) => onFormatChange(e.target.value as OutputFormat)}
							disabled={disabled || isProcessing}
						>
							<option value="original">{TEXTS.OUTPUT_FORMAT_ORIGINAL}</option>
							<option value="png">PNG</option>
							<option value="jpeg">JPEG</option>
							<option value="webp">WebP</option>
						</select>
					</div>
				</div>
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<button
						type="button"
						onClick={onProcessStart}
						disabled={disabled || isProcessing || imageCount === 0}
						className="flex w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.05),0_2px_4px_-2px_rgb(0_0_0_/_0.05)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span className="truncate">{TEXTS.PROCESS_START_BUTTON}</span>
					</button>
					<button
						type="button"
						onClick={onDownload}
						disabled={!canDownload}
						className="flex w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.05),0_2px_4px_-2px_rgb(0_0_0_/_0.05)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span className="truncate">{TEXTS.DOWNLOAD_ZIP_BUTTON}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
