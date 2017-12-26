Convert an email export of Kindle notes into a JSON object.

## Installation

```
npm install kindle-email-to-json --save
```

## How to email an export of your Kindle highlights

**If you're reading on the Kindle iOS or Android app**:

1. Open the "Notebook" section of your book where your annotations are kept
2. Tap the "Share" icon, then tap "Export as HTML"
3. Email the export as an attachment

## API

### toJSON(email) ⇒ <code>Promise.&lt;Object&gt;</code>

Convert a Kindle notes email export into a JSON object. Rejects
if the mail isn't a valid Kindle notes export. The email is
expected to contain at least one HTML attachment.

| Param | Type                                                              |
| ----- | ----------------------------------------------------------------- |
| email | <code>Buffer</code> \| <code>Stream</code> \| <code>String</code> |

## Example

```js
const toJSON = require("kindle-email-to-json");
const email = readFile(emailPath);

toJSON(email).then(data => {
  console.log(data);
});
```
