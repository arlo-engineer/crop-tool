export function downloadZipFile(url: string, filename: string): void {
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;

	document.body.appendChild(anchor);
	anchor.click();

	document.body.removeChild(anchor);
}
