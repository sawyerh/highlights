"use strict";
const _ = require("lodash");
const async = require("async");
const config = require("../siteleaf.config.js");
const merge = require("merge");
const moment = require("moment");
const Parsers = {
  IBooks: require("./ibooks"),
  Readmill: require("./readmill"),
  Kindle: require("./kindle"),
  Text: require("./text")
};
const Siteleaf = require("siteleaf-api");
const slug = require("slug");
const truncate = require("truncate");
const uuid = require("uuid");

const cache = {
  highlights: null,
  books: null
};

const siteleaf = new Siteleaf({
  apiKey: config.key,
  apiSecret: config.secret
});

function addBookAndHighlights(book, highlights) {
  if (!highlights.length) return Promise.resolve();

  const timerName =
    "addBookAndHighlights__" +
    slug(truncate(book.title, 20, { ellipsis: null }));
  console.time(timerName);

  return getBook({
    title: book.title,
    metadata: {
      author: book.author,
      asin: book.asin,
      uuid: uuid.v4()
    }
  })
    .then(createHighlights.bind(null, highlights))
    .then(console.timeEnd.bind(null, timerName));
}

function getHighlights() {
  if (cache.highlights) return Promise.resolve(cache.highlights);

  return siteleaf
    .request(
      "sites/" +
        config.site +
        "/collections/" +
        config.highlights +
        "/documents",
      {
        qs: { per_page: 9999 }
      }
    )
    .then(function(highlights) {
      cache.highlights = highlights;
      return highlights;
    });
}

function filterOutExistingHighlights(book, newHighlights, existingHighlights) {
  if (!existingHighlights.length) return newHighlights;

  existingHighlights = _.where(existingHighlights, {
    metadata: {
      book_uuid: book.metadata.uuid
    }
  });

  if (existingHighlights.length) {
    console.log(
      "Filtering through %d existing highlights for %s",
      existingHighlights.length,
      book.title
    );
    const highlightBodies = existingHighlights.map(function(highlight) {
      return highlight.body.trim();
    });

    newHighlights = _.reject(newHighlights, function(highlight) {
      const res = _.includes(highlightBodies, highlight.content.trim());
      if (res)
        console.log(
          "Found existing highlight matching: %s",
          truncate(highlight.content, 30)
        );
      return res;
    });
  }

  return newHighlights;
}

function createHighlights(highlights, book) {
  return getHighlights() // First we check if any of these highlights already exist and ignore them if so.
    .then(filterOutExistingHighlights.bind(null, book, highlights))
    .then(function(filteredHighlights) {
      if (!filteredHighlights.length) return Promise.resolve();

      return new Promise(function(resolve) {
        console.log(
          "Creating %d highlights for %s",
          filteredHighlights.length,
          book.title
        );
        let i = 1;

        async.eachSeries(
          filteredHighlights,
          function(highlight, cb) {
            return createHighlight(highlight, book)
              .then(function() {
                console.log(
                  "Created %d of %d for %s",
                  i++,
                  filteredHighlights.length,
                  book.title
                );
              })
              .then(function() {
                return cb();
              });
          },
          resolve
        );
      });
    });
}

function createHighlight(highlight, book) {
  const truncatedTitle = truncate(book.title, 20, { ellipsis: null });

  const params = {
    body: highlight.content,
    title: truncatedTitle + ": " + truncate(highlight.content, 60),
    path: slug(truncatedTitle + "-" + uuid.v4(), { lower: true }),
    metadata: {
      book_uuid: book.metadata.uuid,
      comments: highlight.comments,
      location: highlight.location ? String(highlight.location) : null, // convert to string so we can sort in Liquid
      source: highlight.source
    }
  };

  if (highlight.date) {
    // Normalize date formats:
    const highlightMoment = moment(highlight.date, [
      moment.ISO_8601,
      "MMMM D, YYYY"
    ]);

    if (highlightMoment.isValid()) {
      params.metadata.highlighted_on = highlightMoment
        .utcOffset("-05:00")
        .format();
    } else {
      console.log("Invalid date: %s", highlight.date);
    }
  }

  if (highlight.user) params.metadata.highlight_by = highlight.user;

  return siteleaf
    .request(
      "sites/" +
        config.site +
        "/collections/" +
        config.highlights +
        "/documents",
      {
        method: "POST",
        body: params
      }
    )
    .then(function(highlight) {
      return cache.highlights.push(highlight);
    });
}

function getBooks() {
  if (cache.books) return Promise.resolve(cache.books);

  return siteleaf
    .request(
      "sites/" + config.site + "/collections/" + config.books + "/documents",
      {
        qs: { per_page: 9999 }
      }
    )
    .then(function(books) {
      cache.books = books;
      return books;
    });
}

function getBook(bookParams) {
  return getBooks().then(function(books) {
    // We compare the original_title, this way we can change the display title
    // if for some reason it isn't accurate
    const existingBook = _.findWhere(books, {
      metadata: {
        original_title: bookParams.title
      }
    });

    if (existingBook) {
      return Promise.resolve(existingBook);
    } else {
      return createBook(bookParams);
    }
  });
}

function createBook(params) {
  params.metadata = merge(params.metadata, { original_title: params.title });
  params.date = moment()
    .utcOffset("-05:00")
    .format();

  return siteleaf
    .request(
      "sites/" + config.site + "/collections/" + config.books + "/documents",
      {
        method: "POST",
        body: params
      }
    )
    .then(function(book) {
      cache.books.push(book);
      return book;
    });
}

function parse(mail) {
  console.time("complete");

  return new Promise(function(resolve) {
    // An email can include multiple attachments, so we pass and check in each parser:
    let results = [];
    const ibooks = new Parsers.IBooks(mail);
    const readmill = new Parsers.Readmill(mail);
    const kindle = new Parsers.Kindle(mail);
    const plaintext = new Parsers.Text(mail);

    if (ibooks.parseable()) {
      // iBooks can only include the highlights in the body
      results.push(ibooks.parse());
    } else if (plaintext.parseable()) {
      // Check the body if we've identified that it's not an iBooks email:
      results.push(plaintext.parse());
    }

    // The exported reading-data.json or liked-highlights-data.json
    if (readmill.parseable()) results = results.concat(readmill.parse());

    // A JSON file exported using the bookmarklet OR "My Clippings.txt"
    if (kindle.parseable()) results = results.concat(kindle.parse());

    if (!results.length) {
      console.log("No results, exiting.");
      console.timeEnd("complete");
      return resolve();
    }

    // Use async so we don't kill the Siteleaf API:
    async.eachSeries(
      results,
      function(result, cb) {
        addBookAndHighlights(result.book, result.highlights).then(function() {
          return cb();
        });
      },
      function() {
        console.timeEnd("complete");
        resolve();
      }
    );
  });
}

module.exports = parse;
