const mockImportAllHighlight = jest.fn();

jest.mock("../Highlight", () => {
  return { importAll: mockImportAllHighlight };
});
jest.mock("../Volume", () => {
  return { findOrCreate: volume => Promise.resolve(volume) };
});

const importMail = require("../index");
const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);

describe("Importer", () => {
  beforeEach(() => {
    mockImportAllHighlight.mockClear();
  });

  describe("with kindle export", () => {
    let mail;

    beforeAll(async function() {
      mail = await readFile(
        path.resolve(
          __dirname,
          "../../../kindle-email-to-json/__mocks__/machine-platform-crowd.txt"
        )
      );
    });

    it("imports highlights", () => {
      return importMail(mail).then(() => {
        expect(mockImportAllHighlight.mock.calls.length).toBe(1);
        expect(mockImportAllHighlight.mock.calls[0][0]).toMatchSnapshot();
        expect(mockImportAllHighlight.mock.calls[0][1]).toMatchSnapshot();
      });
    });
  });

  describe("with plain text export", () => {
    let mail;

    beforeAll(async function() {
      mail = await readFile(
        path.resolve(
          __dirname,
          "../../../highlights-email-to-json/__mocks__/structureless.txt"
        )
      );
    });

    it("imports highlights", () => {
      return importMail(mail).then(() => {
        expect(mockImportAllHighlight.mock.calls.length).toBe(1);
        expect(mockImportAllHighlight.mock.calls[0][0]).toMatchSnapshot();
        expect(mockImportAllHighlight.mock.calls[0][1]).toMatchSnapshot();
      });
    });
  });
});
