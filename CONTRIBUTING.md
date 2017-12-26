## Install the top-level and nested package dependencies

```
yarn install
```

## Generating docs

```
yarn global add jsdoc-to-markdown
```

```
jsdoc2md file.js
```

## Publishing new releases

Running the following script will create a new tag and release on GitHub, and publish to NPM:

```
npm run publish
```
