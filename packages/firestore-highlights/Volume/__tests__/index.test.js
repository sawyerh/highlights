const Volume = require("../");

describe("Volume", () => {
  it("returns subset of volume attributes", () => {
    const volume = {
      ref: { id: 1 },
      data: () => ({
        title: "A",
        subtitle: "B",
        authors: ["C", "D"],
        image: "/e.jpg",
        foo: "bar"
      })
    };

    expect(Volume.attrs(volume)).toMatchSnapshot();
  });

  it("returns all volumes", () => {
    Volume.all().then(docs => expect(docs).toMatchSnapshot());
  });

  it("creates categories index", () => {
    const categories = ["Foo Bar", "Alpha beta"];
    expect(Volume.indexCategories(categories)).toMatchSnapshot();
  });
});
