var MailParser = require("mailparser").MailParser,
    path = require('path'),
    util = require('util'),
    fs = require('fs')
    Plaintext = require('./parsers/text');

var _import = function _import() {
  var mailparser = new MailParser();
  mailparser.on("end", function(mail){
    var plaintext = new Plaintext(mail);

    console.log("Parseable: ", plaintext.parseable());
    console.log(plaintext.parse(mail));
  });;
  fs.createReadStream(path.resolve('exports/text-email')).pipe(mailparser);
};

_import();

// var _burnItAll = function _burnItAll() {
//   getBooks().then(function (books) {
//     console.log("Deleting %d books", books.length);
//     async.eachSeries(books, function (book, cb) {
//       siteleaf.request('documents/' + book.id, { method: 'DELETE' }).then(cb.bind(null, null));
//     });
//   }).then(getHighlights).then(function (documents) {
//     console.log("Deleting %d highlights", documents.length);
//     async.eachSeries(documents, function (doc, cb) {
//       siteleaf.request('documents/' + doc.id, { method: 'DELETE' }).then(cb.bind(null, null));
//     });
//   });
// };

// var _massImport = function _massImport() {
//   var files = ['exports/readmill-likes-and-kindle-bookmarklet', 'exports/readmill/reading-data-attachment', 'exports/kindle/clippings-email', 'exports/ibooks/email'];

//   async.eachSeries(files, function (file, cb) {
//     var mailparser = new MailParser();
//     mailparser.on("end", function (mail) {
//       parse(mail).then(function () {
//         return cb();
//       });
//     });
//     fs.createReadStream(path.resolve(file)).pipe(mailparser);
//   });
// };

// var _setDates = function _setDates() {
//   getBooks().then(function (books) {
//     async.eachSeries(books, function (book, cb) {
//       console.log("Editing %s", book.title);
//       var date = moment().utcOffset('-05:00').format();
//       var metadata = merge(book.metadata, {
//         date: date
//       });

//       siteleaf.request('documents/' + book.id, {
//         method: 'PUT',
//         body: {
//           published_at: date,
//           metadata: metadata
//         }
//       }).then(function () {
//         return cb();
//       });
//     });
//   });
// };