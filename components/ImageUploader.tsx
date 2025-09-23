"use client";

import { useState } from "react";
import { getMultipleUploadUrls } from "@/app/actions/upload";

export default function ImageUploader() {
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFiles(e.target.files);
	};

	const handleUpload = async () => {
		if (selectedFiles === null || selectedFiles.length === 0) {
			alert("Select file");
			return;
		}

		const fileArray = Array.from(selectedFiles);
		const fileInfos = fileArray.map((file) => ({
			name: file.name,
			type: file.type,
			size: file.size,
		}));

		// get presigned url
		const uploadInfos = await getMultipleUploadUrls(fileInfos);

		// upload in batches of 5
		const batchSize = 5;
		for (let i = 0; i < fileArray.length; i += batchSize) {
			const batch = fileArray.slice(i, i + batchSize);
			const batchInfos = uploadInfos.slice(i, i + batchSize);

			await Promise.all(
				batch.map(async (file, index) => {
					const uploadInfo = batchInfos[index];

					const response = await fetch(uploadInfo.url, {
						method: "PUT",
						body: file,
						headers: {
							"Content-Type": file.type,
						},
					});

					if (!response.ok) {
						throw new Error(`Failed to upload ${file.name}`);
					}

					console.log(`Uploaded ${file.name}`);
				}),
			);
		}
	};

	return (
		<>
			<input type="file" multiple onChange={handleFileChange} />
			<button type="button" onClick={handleUpload}>
				アップロード
			</button>
		</>
	);
}
