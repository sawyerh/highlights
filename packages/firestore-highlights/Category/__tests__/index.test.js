const Category = require("../");

describe("Category", () => {
  it("formats name into Object key", () => {
    expect(Category.key("Foo - Bar")).toBe("fooBar");
  });
});
