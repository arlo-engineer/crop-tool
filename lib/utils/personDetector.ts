import type * as tf from "@tensorflow/tfjs-node";
import type * as cocoSsd from "@tensorflow-models/coco-ssd";
import sharp from "sharp";

let modelCache: cocoSsd.ObjectDetection | null = null;

export interface PersonDetectionResult {
	bbox: [number, number, number, number]; // [x, y, width, height]
	score: number;
}

async function loadModel(): Promise<cocoSsd.ObjectDetection> {
	if (modelCache) {
		return modelCache;
	}

	const [_tf, cocoSsdModule] = await Promise.all([
		import("@tensorflow/tfjs-node"),
		import("@tensorflow-models/coco-ssd"),
	]);

	modelCache = await cocoSsdModule.load({
		base: "lite_mobilenet_v2",
	});

	return modelCache;
}

async function bufferToTensor(
	buffer: Buffer,
	tf: typeof import("@tensorflow/tfjs-node"),
): Promise<{ tensor: tf.Tensor3D; width: number; height: number }> {
	const image = sharp(buffer);
	const { data, info } = await image
		.raw()
		.ensureAlpha()
		.toBuffer({ resolveWithObject: true });

	const tensor = tf.tensor3d(new Uint8Array(data), [
		info.height,
		info.width,
		info.channels,
	]);

	const rgbTensor =
		info.channels === 4 ? tensor.slice([0, 0, 0], [-1, -1, 3]) : tensor;

	if (info.channels === 4) {
		tensor.dispose();
	}

	return {
		tensor: rgbTensor as tf.Tensor3D,
		width: info.width,
		height: info.height,
	};
}

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

		const predictions = await model.detect(tensor);

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
		if (tensor) {
			tensor.dispose();
		}
	}
}
