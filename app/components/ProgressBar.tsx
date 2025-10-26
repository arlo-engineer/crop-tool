import { TEXTS } from "@/lib/constants/text";

interface ProgressBarProps {
	current: number;
	total: number;
	isCompleted: boolean;
}

export default function ProgressBar({
	current,
	total,
	isCompleted,
}: ProgressBarProps) {
	const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
	const statusText = isCompleted
		? TEXTS.PROGRESS_COMPLETED
		: TEXTS.PROGRESS_PROCESSING;

	return (
		<div className="flex flex-col items-center gap-3 p-4 w-full max-w-lg mx-auto">
			<div className="w-full flex justify-between text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
				<span>
					{percentage}% ({current}/{total}
					{TEXTS.IMAGE_COUNT_LABEL}処理済み)
				</span>
				<span>{statusText}</span>
			</div>
			<div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2.5">
				<div
					className="bg-status-success h-2.5 rounded-full transition-all duration-300"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
