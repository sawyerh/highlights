const toJSON = require("../");
const fs = require("mz/fs");
const path = require("path");

function readMail(filename = "atomic-design") {
  return fs.readFile(path.resolve(__dirname, `../__mocks__/${filename}.txt`), {
    encoding: "utf8"
  });
}

describe("kindle-email-to-json", () => {
  it("converts export with only locations", () => {
    return readMail()
      .then(toJSON)
      .then(data => {
        expect(data).toMatchSnapshot();
      });
  });

  it("converts export with page data and multiple authors", () => {
    return readMail("machine-platform-crowd")
      .then(toJSON)
      .then(data => {
        expect(data).toMatchSnapshot();
      });
  });
});
