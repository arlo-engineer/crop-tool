import { createClient } from "@supabase/supabase-js";
import type { UploadedImageMetadata } from "../types/database";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
	throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
}

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY,
);

export async function saveMultipleImageMetadata(
	imagesData: Array<Partial<UploadedImageMetadata>>,
) {
	if (imagesData.length === 0) return;

	const { error } = await supabase.from("images").insert(imagesData);

	if (error) throw error;
}

export async function getKeysFromSessionId(sessionId: string) {
	const { data, error } = await supabase
		.from("images")
		.select("processed_r2_key, processed_name")
		.eq("session_id", sessionId);

	if (error) throw error;

	return data;
}
