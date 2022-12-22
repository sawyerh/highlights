import confidentInResult from "../src/volume/confidentInResult";

describe("confidentInResult", () => {
	let volume: Volume;

	beforeEach(() => {
		volume = {
			title: "Foo Bar",
			authors: ["Doe, John"],
			createdAt: "2021-01-01",
			id: "123",
		};
	});

	it("is confident when title matches", () => {
		const result = {
			volumeInfo: {
				title: volume.title,
				authors: ["Nope"],
			},
		};
		expect(confidentInResult(volume, result)).toBe(true);
	});

	it("is confident without authors", () => {
		delete volume.authors;
		const result = { volumeInfo: { title: volume.title, authors: ["Nope"] } };
		expect(confidentInResult(volume, result)).toBe(true);
	});

	it("is confident when title is at least % similar", () => {
		volume.title = "Foo Bar & the Fans; A quest";
		const result = {
			volumeInfo: {
				title: "Foo Bar and the Fans",
				subtitle: "The Quest for Success in Europe, Asia, and North America",
				authors: ["Nope"],
			},
		};
		expect(confidentInResult(volume, result)).toBe(true);
	});

	it("is not confident when author and title aren't similar", () => {
		const result = {
			volumeInfo: {
				title: "The Fans",
				subtitle: "The Quest for Success in Europe, Asia, and North America",
				authors: ["Nope"],
			},
		};
		expect(confidentInResult(volume, result)).toBe(false);
	});

	it("is not confident when title isn't similar enough", () => {
		const result = {
			volumeInfo: {
				title: "The Fans",
				subtitle: "The Quest for Success in Europe, Asia, and North America",
				authors: volume.authors,
			},
		};
		expect(confidentInResult(volume, result)).toBe(false);
	});
});
