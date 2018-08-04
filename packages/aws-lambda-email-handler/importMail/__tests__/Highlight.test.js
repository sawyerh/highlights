jest.mock("../firestore");

const Highlight = require("../Highlight");
const hash = require("string-hash");
describe("Highlight", () => {
  it("filters existing highlights", () => {
    const allHighlights = [
      { hash: hash("ABC") },
      { hash: hash("DEF") },
      { hash: hash("HIG") }
    ];

    const existingHighlights = [{ get: () => allHighlights[1].hash }];

    const highlights = Highlight.filterExisting(
      allHighlights,
      existingHighlights
    );

    expect(highlights.length).toBe(2);
    expect(highlights[0].hash).toBe(allHighlights[0].hash);
    expect(highlights[1].hash).toBe(allHighlights[2].hash);
  });
});
