import ImageCard from "./ImageCard";

interface ImageGridProps {
	images: Array<{
		id: string;
		fileName: string;
		previewUrl: string | null;
		status: "loading" | "pending" | "processing" | "completed" | "error";
	}>;
}

export default function ImageGrid({ images }: ImageGridProps) {
	if (images.length === 0) {
		return null;
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 p-4 rounded-lg bg-background shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.05),0_2px_4px_-2px_rgb(0_0_0_/_0.05)] border border-border">
			{images.map((image) => (
				<ImageCard
					key={image.id}
					fileName={image.fileName}
					previewUrl={image.previewUrl}
					status={image.status}
				/>
			))}
		</div>
	);
}
