**ALPHA: This is a work in progress node library for the Siteleaf v2 API.**

# About Siteleaf

Siteleaf is a smart, lightweight platform for creating and maintaining websites. We believe that content management shouldn’t be hard. That you should be able to host your website anywhere you want. That websites should be able to outlive their CMS. That our tools should be simplified, not dumbed down.

# Installation

```
npm install siteleaf
```

# Usage

```js
var Siteleaf = require('siteleaf')

var client = new Siteleaf({
  apiKey: "YOUR SITELEAF API KEY HERE",
  apiSecret: "YOUR SITELEAF API SECRET HERE"
});
```

(Access your API keys from your [Siteleaf account page](https://manage.siteleaf.com/account))

All requests are made using the [`request-promise`](https://www.npmjs.com/package/request-promise) package, therefore **all requests return a Promise with the response as the first argument.**

## request(path, params)

A generic method for making Siteleaf API requests:

GET requests:

```js
client.request(`sites/${config.site_id}/pages`, {
  qs: { per_page: 50 }
}).then(function (pages) {
  console.log(pages);
});
```

POST/PUT requests:

```js
client.request(`sites/${config.site_id}/pages`, {
  method: 'POST',
  body: {
    body: "Hello world",
    title: "Example",
    path: "example",
    metadata: {
      colors: ["Red", "Green", "Blue"]
    }
  }
}).then(function (page) {
  console.log("Created page with slug: %s", page.slug);
});
```

DELETE requests:

```js
client.request(`pages/${page.id}`, { method: 'DELETE' });
```
