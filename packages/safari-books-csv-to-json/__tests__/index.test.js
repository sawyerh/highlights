const toJSON = require("../");
const fs = require("mz/fs");
const path = require("path");

function readMail(filename = "email") {
	return fs.readFile(path.resolve(__dirname, `../__mocks__/${filename}.txt`), {
		encoding: "utf8",
	});
}

describe("safari-books-csv-to-json", () => {
	it("converts export with a note", async () => {
		const source = await readMail();
		const data = await toJSON(source);
		expect(data).toMatchSnapshot();
	});
});
