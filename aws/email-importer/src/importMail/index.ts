import someSeries from "async/someSeries";
import AWS from "aws-sdk";
import textToJSON from "highlights-email-to-json";
import kindleClippingsToJSON from "kindle-clippings-to-json";
import kindleEmailToJSON from "kindle-email-to-json";
import safariEmailToJSON from "safari-books-csv-to-json";

import { importHighlights } from "./importHighlights";
import { importVolume } from "./importVolume";

/**
 * Create the volume and highlights when they don't already exists
 */
async function addVolumeAndHighlights(data: Awaited<ReturnType<Importer>>) {
	const { highlights, volume } = data;
	const volumeWithHighlightsCount = {
		...volume,
		highlightsCount: highlights.length,
	};

	if (!highlights.length)
		return Promise.reject(new Error("No highlights to import"));

	const volumeDoc = await importVolume(volumeWithHighlightsCount);
	return importHighlights(highlights, volumeDoc);
}

/**
 * Run all possible importers (e.g. Kindle, plain text)
 */
function importMail(mail: AWS.S3.Body) {
	return new Promise<void>((resolve, reject) => {
		const importers = [
			kindleEmailToJSON,
			safariEmailToJSON,
			kindleClippingsToJSON,
			textToJSON,
		];

		someSeries(
			importers,
			async (runImporter: Importer) => {
				// each importer is ran in serial and stops once one runs successfully
				try {
					const data = await runImporter(mail);
					await addVolumeAndHighlights(data);
					return true;
				} catch (err) {
					console.log(err.message);
					return !!err.message.match(/No new highlights/);
				}
			},
			(e, importerSuccess) => {
				if (importerSuccess) return resolve();
				return reject(Error("No importer was able to process the email."));
			},
		);
	});
}

export default importMail;
