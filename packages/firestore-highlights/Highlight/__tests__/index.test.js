const db = require("firebase-admin").firestore();
const Highlight = require("../")(db);

describe("Highlight", () => {
  let Doc;

  beforeEach(() => {
    Doc = {
      ref: { id: 1 },
      data: () => ({
        body: "Hello world",
        location: "123",
        hash: 12345,
        visible: true,
        volume: {
          id: "vol123"
        },
        documentSentiment: {
          magnitude: 0.800000011920929,
          score: -0.4000000059604645
        },
        languageAnalysis: {
          entities: [
            {
              // Common entity
              name: "trip",
              mentions: [{ type: "COMMON" }],
              type: "EVENT",
              metadata: {}
            },
            {
              // Proper entity with mentions
              name: "Cairo, Eqypt",
              mentions: [{ type: "PROPER" }],
              type: "LOCATION",
              metadata: {}
            },
            {
              // Entity with no mentions, but with a Wiki URL
              name: "British",
              type: "LOCATION",
              metadata: {
                wikipedia_url: "https://en.wikipedia.org/wiki/United_Kingdom"
              }
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

  it("handles case where entities are not present", () => {
    const data = Doc.data();
    delete data.languageAnalysis.entities;

    expect(Highlight.properEntities(data)).toBeUndefined();
  });

  it("creates entities index", () => {
    expect(
      Highlight.indexEntities(Highlight.properEntities(Doc.data()))
    ).toMatchSnapshot();
  });
});
