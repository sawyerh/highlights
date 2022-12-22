const toJSON = require("../");
const fs = require("mz/fs");
const path = require("path");

function readMail(filename = "clippings-email") {
	return fs.readFile(path.resolve(__dirname, `../__mocks__/${filename}.txt`), {
		encoding: "utf8",
	});
}

describe("kindle-clippings-to-json", () => {
	it("converts clippings email", () => {
		return readMail()
			.then(toJSON)
			.then((data) => {
				expect(data).toMatchSnapshot();
			});
	});
});
