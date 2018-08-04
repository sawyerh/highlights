Convert an email including Kindle clippings into a JSON object.

## Installation

```
npm install kindle-clippings-to-json --save
```

## How to import your Kindle clippings

1. Plug your Kindle into a computer using the USB cable
2. Find the `My Clippings.txt` file
3. Copy the clippings you want to import, beginning with the `==========`
4. Paste the clippings into the email body

## API

### toJSON(email) ⇒ <code>Promise.&lt;Object&gt;</code>

Convert a Kindle clippings email into a JSON object. Rejects
if the mail doesn't include valid Kindle clippings.

| Param | Type                                                              |
| ----- | ----------------------------------------------------------------- |
| email | <code>Buffer</code> \| <code>Stream</code> \| <code>String</code> |

## Example

```js
const toJSON = require("kindle-clippings-to-json");
const email = readFile(emailPath);

toJSON(email).then(data => {
  console.log(data);
});
```
