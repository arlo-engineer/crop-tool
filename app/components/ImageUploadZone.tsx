"use client";

import { useRef, useState } from "react";
import { TEXTS } from "@/lib/constants/text";

interface ImageUploadZoneProps {
	onFilesSelected: (files: File[]) => void | Promise<void>;
	disabled?: boolean;
}

export default function ImageUploadZone({
	onFilesSelected,
	disabled = false,
}: ImageUploadZoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!disabled) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		if (disabled) return;

		const files = Array.from(e.dataTransfer.files).filter((file) =>
			file.type.startsWith("image/"),
		);
		if (files.length > 0) {
			onFilesSelected(files);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			onFilesSelected(files);
		}
	};

	return (
		<label
			className={`flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-border-light dark:border-border-dark px-6 py-14 sm:py-20 md:py-28 lg:py-32 w-full max-w-3xl mx-auto shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.05),0_2px_4px_-2px_rgb(0_0_0_/_0.05)] ${
				isDragging ? "bg-primary/10 border-primary" : ""
			} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} transition-all`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div className="flex max-w-md flex-col items-center gap-4 text-center">
				<span className="material-symbols-outlined text-5xl text-text-secondary-light dark:text-text-secondary-dark">
					cloud_upload
				</span>
				<p className="text-xl font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">
					{TEXTS.UPLOAD_TITLE}
				</p>
				<p className="text-sm font-normal leading-normal text-text-secondary-light dark:text-text-secondary-dark">
					{TEXTS.UPLOAD_MAX_FILES}
				</p>
			</div>
			<div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-border-light dark:bg-border-dark px-4">
				<p className="text-sm font-medium leading-normal text-text-secondary-light dark:text-text-secondary-dark">
					{TEXTS.UPLOAD_SUPPORTED_FORMATS}
				</p>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				name="files"
				multiple
				accept="image/*"
				className="hidden"
				onChange={handleFileInputChange}
				disabled={disabled}
			/>
		</label>
	);
}
