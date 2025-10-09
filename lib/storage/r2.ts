import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

if (
	!process.env.R2_ENDPOINT ||
	!process.env.R2_ACCESS_KEY ||
	!process.env.R2_SECRET_KEY
) {
	throw new Error("R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY are required");
}

export const s3Client = new S3Client({
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY,
		secretAccessKey: process.env.R2_SECRET_KEY,
	},
	region: "auto",
});

export async function uploadToR2(
	key: string,
	buffer: Buffer,
	mimeType: string,
): Promise<void> {
	const command = new PutObjectCommand({
		Bucket: process.env.R2_BUCKET_NAME,
		Key: key,
		Body: buffer,
		ContentType: mimeType,
	});

	await s3Client.send(command);
}
