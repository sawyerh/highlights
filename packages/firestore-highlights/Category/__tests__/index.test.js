const db = require("firebase-admin").firestore();
const Category = require("../")(db);

describe("Category", () => {
  it("formats name into Object key", () => {
    expect(Category.key("Foo - Bar")).toBe("fooBar");
  });
});
