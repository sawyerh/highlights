const db = require("firebase-admin").firestore();
const Entity = require("../")(db);

describe("Entity", () => {
  it("returns subset of Entity attributes", () => {
    const data = {
      name: "Cairo",
      type: "LOCATION",
      metadata: {
        wikipedia_url: "https://en.wikipedia.org/wiki/Cairo",
        mid: "/m/01w2v"
      },
      mentions: [{ type: "PROPER" }]
    };

    expect(Entity.attrs(data)).toMatchSnapshot();
  });

  it("formats name into Object key", () => {
    expect(Entity.key("Foo - Bar")).toBe("fooBar");
  });
});
