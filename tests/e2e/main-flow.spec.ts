import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { validateZipImages } from "../helpers/zipValidator";

test.describe("Main Flow - Image Processing E2E", () => {
	test("should process images, download ZIP, and validate results", async ({
		page,
	}) => {
		// 1. Navigate to home page
		await page.goto("/");

		// Verify page loaded (Next.js default title)
		await expect(page).toHaveTitle(/Create Next App/i);

		// 2. Select test images
		const fixturesPath = join(__dirname, "../fixtures");
		const fileInput = page.locator('input[type="file"]');

		// Upload multiple test images
		await fileInput.setInputFiles([
			join(fixturesPath, "test-image-1.jpg"),
			join(fixturesPath, "test-image-2.png"),
			join(fixturesPath, "test-person-image.jpg"),
		]);

		// 3. Click the processing button
		const processButton = page.locator('button[type="submit"]');
		await expect(processButton).toBeVisible();
		await expect(processButton).toContainText(/処理開始/i);

		// Click and wait for processing to complete
		await processButton.click();

		// 4. Wait for processing to complete
		// The "Download ZIP" button should appear after processing
		const downloadButton = page.locator('button:has-text("Download ZIP")');

		// Wait with a longer timeout for processing
		await expect(downloadButton).toBeVisible({ timeout: 60000 });

		// 5. Download ZIP file
		const downloadPromise = page.waitForEvent("download");
		await downloadButton.click();
		const download = await downloadPromise;

		// Save ZIP file temporarily
		const zipPath = join(
			__dirname,
			"../temp",
			await download.suggestedFilename(),
		);
		await download.saveAs(zipPath);

		// 6. Validate ZIP contents
		const zipBuffer = readFileSync(zipPath);

		// Validate all images have correct dimensions (640x800)
		const results = await validateZipImages(zipBuffer, 640, 800, true);

		// Check that all images were processed
		expect(results.length).toBe(3);

		// 7. Validate image sizes
		for (const result of results) {
			expect(result.width).toBe(640);
			expect(result.height).toBe(800);
		}

		// 8. Validate person centering (for test-person-image.jpg)
		const personImageResult = results.find((r) =>
			r.filename.includes("person"),
		);

		if (personImageResult) {
			// If person was detected, verify it's centered
			if (personImageResult.personDetected) {
				expect(personImageResult.isPersonCentered).toBe(true);
			}
		}

		// Clean up
		// TODO: Add code to delete the temp file from temp directory, r2 storage and supabase
		console.log("Test completed successfully!");
		console.log("Validation results:", results);
	});
});
