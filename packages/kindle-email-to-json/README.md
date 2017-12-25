Convert an email export of Kindle notes into a JSON object.

## API

### toJSON(email) ⇒ <code>Promise.&lt;Object&gt;</code>

Convert a Kindle notes email export into a JSON object. Rejects
if the mail isn't a valid Kindle notes export. The email is
expected to contain at least one HTML attachment.

**Kind**: global function

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
