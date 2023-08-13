const toJSON = require("../");
const fs = require("mz/fs");
const path = require("path");

function readMail(filename = "structureless") {
	return fs.readFile(path.resolve(__dirname, `../__mocks__/${filename}.txt`), {
		encoding: "utf8",
	});
}

describe("highlights-email-to-json", () => {
	it("converts email", () => {
		return readMail()
			.then(toJSON)
			.then((data) => {
				expect(data).toMatchSnapshot();
			});
	});

	it("returns just the title if there's no body of notes", () => {
		return readMail("just-title")
			.then(toJSON)
			.then((data) => {
				expect(data).toMatchSnapshot();
			});
	});
});
