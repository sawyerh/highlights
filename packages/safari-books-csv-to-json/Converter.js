const csvtojson = require("csvtojson");

/**
 * Convert email CSV into JSON
 * @param {String} csv
 * @returns {Object}
 */
class Converter {
	constructor(csv) {
		this.csv = csv;
	}

	/**
	 * Parse CSV into array of JSON objects
	 * @returns {Promise<Object[]>}
	 */
	jsonArray() {
		return csvtojson().fromString(this.csv);
	}

	/**
	 * Determine whether the given CSV is a valid Safari Books highlights export
	 * @returns {Promise<Boolean>}
	 */
	async valid() {
		const jsonArray = await this.jsonArray();

		if (this.csv) {
			return jsonArray && jsonArray.length && jsonArray[0].Highlight;
		}

		return false;
	}

	/**
	 * Parse the array to pull out the volume's title, author, and highlights
	 * @returns {Promise<Object>}
	 */
	async getJSON() {
		const jsonArray = await this.jsonArray();
		const highlight = jsonArray[0];
		const title = highlight["Book Title"];
		const authors = highlight.Authors.split(",").map((s) => s.trim());

		return {
			volume: {
				title: title,
				authors: authors,
			},
			highlights: this.highlights(jsonArray),
		};
	}

	/**
	 * Parse the highlights and notes from the HTML
	 * @param {Object[]} jsonArray
	 * @returns {Array} highlights
	 */
	highlights(jsonArray) {
		const highlights = jsonArray.map((data) => {
			const highlight = {
				content: data.Highlight,
				location: data["Chapter Title"],
			};

			if (highlight["Personal Note"]) {
				highlight.notes = [highlight["Personal Note"]];
			}

			return highlight;
		});

		return highlights;
	}
}

module.exports = Converter;
