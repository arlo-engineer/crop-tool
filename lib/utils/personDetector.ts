import type * as tf from "@tensorflow/tfjs-node";
import type * as cocoSsd from "@tensorflow-models/coco-ssd";
import sharp from "sharp";

let modelCache: cocoSsd.ObjectDetection | null = null;

export interface PersonDetectionResult {
	bbox: [number, number, number, number]; // [x, y, width, height]
	score: number;
}

/**
 * Load and cache the COCO-SSD model
 * Uses dynamic import to avoid Next.js webpack bundling issues
 */
async function loadModel(): Promise<cocoSsd.ObjectDetection> {
	if (modelCache) {
		return modelCache;
	}

	// Dynamic import to avoid Next.js webpack issues with tfjs-node
	const [_tf, cocoSsdModule] = await Promise.all([
		import("@tensorflow/tfjs-node"),
		import("@tensorflow-models/coco-ssd"),
	]);

	modelCache = await cocoSsdModule.load({
		base: "lite_mobilenet_v2",
	});

	return modelCache;
}

/**
 * Convert Sharp buffer to TensorFlow.js tensor
 */
async function bufferToTensor(
	buffer: Buffer,
	tf: typeof import("@tensorflow/tfjs-node"),
): Promise<{ tensor: tf.Tensor3D; width: number; height: number }> {
	// Get image metadata and raw pixel data
	const image = sharp(buffer);
	const { data, info } = await image
		.raw()
		.ensureAlpha()
		.toBuffer({ resolveWithObject: true });

	// Convert raw buffer to tensor (RGBA format)
	const tensor = tf.tensor3d(new Uint8Array(data), [
		info.height,
		info.width,
		info.channels,
	]);

	// Remove alpha channel if present (COCO-SSD expects RGB)
	const rgbTensor =
		info.channels === 4 ? tensor.slice([0, 0, 0], [-1, -1, 3]) : tensor;

	// Clean up intermediate tensor
	if (info.channels === 4) {
		tensor.dispose();
	}

	return {
		tensor: rgbTensor as tf.Tensor3D,
		width: info.width,
		height: info.height,
	};
}

/**
 * Detect person in image buffer using COCO-SSD
 * Returns the bounding box of the person with highest confidence score
 * Returns null if no person is detected above the minimum score threshold
 */
export async function detectPerson(
	buffer: Buffer,
	minScore = 0.5,
): Promise<PersonDetectionResult | null> {
	let tensor: tf.Tensor3D | null = null;

	try {
		const tfModule = await import("@tensorflow/tfjs-node");

		const model = await loadModel();
		const { tensor: imageTensor } = await bufferToTensor(buffer, tfModule);
		tensor = imageTensor;

		// Detect objects
		const predictions = await model.detect(tensor);

		// Filter for person class and find highest confidence
		const personPredictions = predictions
			.filter((pred) => pred.class === "person" && pred.score >= minScore)
			.sort((a, b) => b.score - a.score);

		if (personPredictions.length === 0) {
			return null;
		}

		const bestPerson = personPredictions[0];

		return {
			bbox: bestPerson.bbox as [number, number, number, number],
			score: bestPerson.score,
		};
	} finally {
		// Clean up tensor to prevent memory leak
		if (tensor) {
			tensor.dispose();
		}
	}
}
