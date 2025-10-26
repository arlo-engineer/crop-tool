"use client";

import { useState } from "react";

export default function AdBanner() {
	const [isVisible, setIsVisible] = useState(true);

	const handleClose = () => {
		setIsVisible(false);
	};

	if (!isVisible) return null;

	return (
		<div className="sticky bottom-0 left-0 right-0 z-50 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-t border-border-light dark:border-border-dark py-3">
			<div className="flex justify-center items-center relative">
				{/* Close button */}
				<button
					type="button"
					onClick={handleClose}
					className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors group"
					aria-label="広告を閉じる"
				>
					<svg
						className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-text-primary-light dark:group-hover:text-text-primary-dark transition-colors"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* Ad area */}
				<div className="relative w-[320px] h-[50px] md:w-[728px] md:h-[90px]">
					<span className="absolute top-1 right-1 text-xs text-text-secondary-light dark:text-text-secondary-dark bg-background-light/80 dark:bg-background-dark/80 px-1.5 py-0.5 rounded-sm">
						Ad
					</span>
					<div className="w-full h-full bg-border-light dark:bg-border-dark flex items-center justify-center rounded-md">
						<span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
							Affiliate Advertisement
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
