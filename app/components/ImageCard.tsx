import Image from "next/image";

interface ImageCardProps {
	fileName: string;
	previewUrl: string | null;
	status: "loading" | "pending" | "processing" | "completed" | "error";
}

export default function ImageCard({
	fileName,
	previewUrl,
	status,
}: ImageCardProps) {
	const getStatusColor = () => {
		switch (status) {
			case "completed":
				return "bg-status-success";
			case "error":
				return "bg-red-500";
			case "processing":
				return "bg-status-warning";
			case "loading":
				return "bg-blue-400";
			default:
				return "bg-gray-400";
		}
	};

	return (
		<div className="flex flex-col gap-2 relative">
			<div
				className={`absolute top-2 right-2 h-3 w-3 rounded-full ${getStatusColor()} ring-2 ring-white z-10`}
			/>
			<div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg overflow-hidden relative">
				{previewUrl ? (
					<Image
						src={previewUrl}
						alt={fileName}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 150px"
						loading="lazy"
						priority={false}
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
				)}
			</div>
			<p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium leading-normal truncate">
				{fileName}
			</p>
		</div>
	);
}
