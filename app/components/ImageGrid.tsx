"use client";

import { useState } from "react";
import ImageCard from "./ImageCard";
import { TEXTS } from "@/lib/constants/text";

interface ImageGridProps {
	images: Array<{
		id: string;
		fileName: string;
		previewUrl: string | null;
		status: "loading" | "pending" | "processing" | "completed" | "error";
	}>;
}

export default function ImageGrid({ images }: ImageGridProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (images.length === 0) {
		return null;
	}

	const shouldShowToggle = images.length > 8;

	return (
		<div className="relative">
			<div
				className={`grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 p-4 pb-10 rounded-lg bg-background shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.05),0_2px_4px_-2px_rgb(0_0_0_/_0.05)] border border-border overflow-hidden transition-all duration-300 ${
					shouldShowToggle && !isExpanded ? "max-h-[340px]" : ""
				}`}
			>
				{images.map((image) => (
					<ImageCard
						key={image.id}
						fileName={image.fileName}
						previewUrl={image.previewUrl}
						status={image.status}
					/>
				))}
			</div>

			{shouldShowToggle && !isExpanded && (
				<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none">
					<div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
						<button
							type="button"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex items-center gap-2 justify-center -mt-4 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors z-10"
						>
							<span>{isExpanded ? TEXTS.IMAGE_GRID_SHOW_LESS : TEXTS.IMAGE_GRID_SHOW_MORE}</span>
							<span
								className={`material-symbols-outlined text-xl transition-transform transform ${
									isExpanded ? "rotate-180" : ""
								}`}
							>
								expand_more
							</span>
						</button>
					</div>
				</div>
			)}

			{shouldShowToggle && isExpanded && (
				<div className="flex justify-center -mt-8">
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2 justify-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors z-10"
					>
						<span>{isExpanded ? TEXTS.IMAGE_GRID_SHOW_LESS : TEXTS.IMAGE_GRID_SHOW_MORE}</span>
						<span
							className={`material-symbols-outlined text-xl transition-transform transform ${
								isExpanded ? "rotate-180" : ""
							}`}
						>
							expand_more
						</span>
					</button>
				</div>
			)}
		</div>
	);
}
