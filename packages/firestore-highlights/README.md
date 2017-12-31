> Firestore models used for storing highlights and their corresponding data

## Usage

```js
// Require and initialize firebase-admin before requiring the models
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });

const Volume = require("@sawyerh/firestore-highlights/Volume");
```
