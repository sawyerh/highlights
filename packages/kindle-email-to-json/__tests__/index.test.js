const toJSON = require("../");
const path = require("path");
const { readFile } = require("fs");
const { promisify } = require("util");

const asyncReadFile = promisify(readFile);

function readMail(filename = "atomic-design") {
	return asyncReadFile(
		path.resolve(__dirname, `../__mocks__/${filename}.txt`),
		{
			encoding: "utf8",
		},
	);
}

describe("kindle-email-to-json", () => {
	it("converts export with a note", () => {
		expect.assertions();

		return readMail()
			.then(toJSON)
			.then((data) => {
				expect(data).toMatchSnapshot();
			});
	});

	it("converts export with page data and multiple authors", () => {
		expect.assertions();

		return readMail("machine-platform-crowd")
			.then(toJSON)
			.then((data) => {
				expect(data).toMatchSnapshot();
			});
	});

	it("throws error when email lacks an attachment", () => {
		expect.assertions();

		const promise = readMail("no-attachment").then(toJSON);
		expect(promise).rejects.toThrowError();
	});
});
