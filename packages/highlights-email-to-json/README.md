Convert an email export of notes into a JSON object. This is handy for saving notes from Instapaper or directly from the web.

## Installation

```
npm install highlights-email-to-json --save
```

## Expected email format

The email you send must match the following format in order to be converted by this package.

```
---
title: Book Title
authors: Author Name; Another author name
---
Note one text.


Note two text.
```

_Note: The front-matter section at the top will accept any attribute._

## API

### toJSON(email) ⇒ <code>Promise.&lt;Object&gt;</code>

Convert a notes email export into a JSON object. Rejects
if the mail isn't a valid notes export.

| Param | Type                                                              |
| ----- | ----------------------------------------------------------------- |
| email | <code>Buffer</code> \| <code>Stream</code> \| <code>String</code> |

## Example

```js
const toJSON = require("highlights-email-to-json");
const email = readFile(emailPath);

toJSON(email).then(data => {
  console.log(data);
});
```
