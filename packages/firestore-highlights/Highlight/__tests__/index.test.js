const Highlight = require("../");

describe("Highlight", () => {
  let Doc;

  beforeEach(() => {
    Doc = {
      ref: { id: 1 },
      data: () => ({
        body: "Hello world",
        location: "123",
        hash: 12345,
        documentSentiment: {
          magnitude: 0.800000011920929,
          score: -0.4000000059604645
        },
        languageAnalysis: {
          entities: [
            { mentions: [{ type: "COMMON" }], name: "trip", type: "EVENT" },
            {
              name: "Cairo, Eqypt",
              type: "LOCATION",
              metadata: {
                wikipedia_url: "https://en.wikipedia.org/wiki/Cairo",
                mid: "/m/01w2v"
              },
              mentions: [{ type: "PROPER" }]
            }
          ]
        }
      })
    };
  });

  it("returns subset of Highlight attributes", () => {
    expect(Highlight.attrs(Doc)).toMatchSnapshot();
  });

  it("creates categories index", () => {
    const categories = [{ name: "Foo Bar" }, { name: "Alpha beta" }];
    expect(Highlight.indexCategories(categories)).toMatchSnapshot();
  });

  it("creates entities index", () => {
    expect(
      Highlight.indexEntities(Highlight.properEntities(Doc.data()))
    ).toMatchSnapshot();
  });
});
