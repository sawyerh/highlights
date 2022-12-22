// Lifted from https://www.npmjs.com/package/kindle-my-clippings
// with small tweaks to return the parsed info right away.
"use strict";

const Clip = function () {
	this.format = "object";

	this.options = {
		fields: ["title", "author", "time", "text", "type", "location", "page"],
		displayType: ["Highlight"],
	};
};

Clip.prototype.splitFileIntoRecords = function (data) {
	// @todo check if file is kindle clippings valid format, contains ========== (take from tests ?)
	return data.split("==========\n");
};

Clip.prototype.splitRecord = function (record) {
	const lines = record.split(/\n\n|\n-/);
	const trimmedLines = [];

	for (let j = 0; j < lines.length; j++) {
		const l = lines[j];
		if (l !== "") {
			trimmedLines.push(l.trim().replace(/\n/g, " "));
		}
	}

	return trimmedLines;
};

Clip.prototype.getFirstLine = function (lines) {
	if (lines[0] !== undefined) {
		const t = lines[0].split(" (");
		const author = t[1] ? t[1].slice(0, -1) : "";
		return {
			title: t[0],
			author: author,
		};
	} else {
		return false;
	}
};

Clip.prototype.getSecondLine = function (lines) {
	if (lines[1] !== undefined) {
		const t = lines[1].split("|");

		const singleRecord = {};
		for (let y = 0; y < t.length; y++) {
			const el = t[y];
			// Examples of type and location
			// * Highlight Loc. 516
			// * Highlight on Page 19
			// * Highlight on Page 3 | Loc. 140  |
			// * Note on Page 11
			// * Bookmark Loc. 241

			// type: Highlight | Bookmark | Note
			if (el.match(/Highlight/)) {
				singleRecord.type = "Highlight";
			} else if (el.match(/Bookmark/)) {
				singleRecord.type = "Bookmark";
			} else if (el.match(/Note/)) {
				singleRecord.type = "Note";
			}

			// on Page (if exists)
			if (el.match(/on page/)) {
				const p = el.split("on page");
				singleRecord.page = this.trim(p.pop());
			}

			// location
			if (el.match(/Location/)) {
				const l = el.split("Location");
				singleRecord.location = this.trim(l.pop());
			}
		}
		return singleRecord;
	} else {
		return false;
	}
};

Clip.prototype.getThirdLine = function (lines) {
	if (lines[2] !== undefined) {
		return this.trim(lines[2]);
	} else {
		return false;
	}
};

Clip.prototype.getTitles = function (col) {
	const titles = [];
	col.forEach((el) => {
		titles.push(el.title);
	});
	const unique = titles.filter((itm, i, titles) => {
		return i === titles.indexOf(itm);
	});
	return unique;
};

Clip.prototype.getParsed = function (data) {
	const self = this;

	// split clippings into records
	const arr = self.splitFileIntoRecords(data);
	const col = [];

	// iterate through each record
	for (let i = 0; i < arr.length; i++) {
		const record = arr[i];

		// split record into lines (section of a record - title / time / text)
		const lines = self.splitRecord(record);

		// initialize empty record object
		const singleRecord = {};

		// first line - title and author
		const first = self.getFirstLine(lines);

		if (first) {
			if (self.options.fields.indexOf("title") !== -1)
				singleRecord.title = first.title;
			if (self.options.fields.indexOf("author") !== -1)
				singleRecord.author = first.author;
		}

		// second line - type, location, time
		const second = self.getSecondLine(lines);
		if (second) {
			if (self.options.fields.indexOf("time") !== -1)
				singleRecord.time = second.time;
			if (self.options.fields.indexOf("type") !== -1)
				singleRecord.type = second.type;
			if (self.options.fields.indexOf("location") !== -1)
				singleRecord.location = second.location;
			if (self.options.fields.indexOf("page") !== -1)
				singleRecord.page = second.page;
		}

		// third line - content
		const third = self.getThirdLine(lines);
		if (third) {
			if (self.options.fields.indexOf("text") !== -1) singleRecord.text = third;
		}

		// push record to collection
		// @todo - take from options.displayType
		if (self.options.displayType.indexOf(second.type) !== -1)
			col.push(singleRecord);
	} // end of record iteration

	if (self.format === "html") {
		this.generateHTMLFile(col);
	}
	// @TODO code duplication
	else if (self.format === "object") {
		const jsonArray = [];
		col.forEach((el) => {
			jsonArray.push(el);
		});
		return jsonArray;
	} else if (self.format === "json") {
		const jsonArray = [];
		col.forEach((el) => {
			jsonArray.push(el);
		});
		const jsonOutput = JSON.stringify(jsonArray);
		return jsonOutput;
	} else if (self.format === "byTitle") {
		const titles = [];
		col.forEach((el) => {
			titles.push(el.title);
		});
		const unique = titles.filter((itm, i, titles) => {
			return i === titles.indexOf(itm);
		});

		const output = [];
		unique.forEach((t) => {
			output[t] = [];
			col.forEach((el) => {
				if (el.title === t) {
					// removing title property
					delete el.title;
					output[t].push(el);
				}
			});
		});

		return output;
	}
};

Clip.prototype.trim = function (str) {
	str = str.replace(/^\s+/, "");
	for (let i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};

module.exports = Clip;
