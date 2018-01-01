> Firestore models used for storing highlights and their corresponding data

## Usage

```js
const admin = require("firebase-admin");
const firestore = admin.firestore();

// Require a single model
const Volume = require("@sawyerh/firestore-highlights/Volume")(firestore);

// or require multiple at once
const { Entity, Volume } = require("@sawyerh/firestore-highlights")(firestore);
```
