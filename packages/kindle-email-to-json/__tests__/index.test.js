const toJSON = require("../");
const fs = require("mz/fs");
const path = require("path");

describe("kindle-email-to-json", () => {
  let mail;

  beforeAll(() =>
    fs
      .readFile(path.resolve(__dirname, "../__mocks__/email.txt"), {
        encoding: "utf8"
      })
      .then(contents => {
        mail = contents;
      })
  );

  it("parses book title and authors", () => {
    return toJSON(mail).then(data => {
      expect(data).toMatchSnapshot();
    });
  });
});
