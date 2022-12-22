Converts an email attachment consisting of an O'Reilly Safari Books CSV highlights export into a JSON object

## Installation

```
npm install safari-books-csv-to-json --save
```

## How to retrieve an export of your Safari Books highlights

1. Navigate to the "Highlights" page on [safaribooksonline.com](https://www.safaribooksonline.com)
2. Select the book you want to export
3. Select "Export all notes and highlights"

## API

## toJSON(source) ⇒ <code>Promise.&lt;Object&gt;</code>

Convert a Safari Books CSV highlights export into a JSON object.
Rejects if the source isn't a valid Safari Books CSV export. The email is
expected to contain at least one CSV attachment.

| Param  | Type                                                              |
| ------ | ----------------------------------------------------------------- |
| source | <code>Buffer</code> \| <code>Stream</code> \| <code>String</code> |

## Example

```js
const toJSON = require("safari-books-csv-to-json");
const email = readFile(emailPath);

toJSON(email).then((data) => {
	console.log(data);
});
```
