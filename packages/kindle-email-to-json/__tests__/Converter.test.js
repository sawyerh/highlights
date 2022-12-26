const Converter = require("../Converter");
const path = require("path");
const { readFile } = require("fs");
const { promisify } = require("util");

const asyncReadFile = promisify(readFile);

function readExport(filename) {
  return asyncReadFile(path.resolve(__dirname, `../__mocks__/${filename}`), {
    encoding: "utf8",
  });
}

describe("Converter", () => {
  it("parses HTML file into JSON", async () => {
    const html = await readExport("english-export.html");
    const converter = new Converter(html);

    expect(converter.getJSON()).toMatchSnapshot();
  });

  it("supports parsing of location from non-English exports", async () => {
    const html = await readExport("german-export.html");
    const converter = new Converter(html);

    expect(converter.getJSON()).toMatchSnapshot();
  });
});
