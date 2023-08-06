import fs from "fs";
import path from "path";

import { getHighlightsAndVolumeFromEmail } from "../../src/services/Parser";

const EMAIL_FIXTURE = fs.readFileSync(
	path.resolve(__dirname, "../fixtures/email.txt"),
	"utf8",
);

describe("getHighlightsAndVolumeFromEmail", () => {
	it("parses an email into a Volume and Highlights", async () => {
		const { highlights, volume } = await getHighlightsAndVolumeFromEmail(
			// @ts-expect-error - mock
			Buffer.from(EMAIL_FIXTURE),
		);

		expect(volume.title).toBe(
			"Machine, Platform, Crowd: Harnessing Our Digital Future",
		);
		expect(volume.authors).toHaveLength(2);
		expect(highlights).toHaveLength(14);
	});
});
