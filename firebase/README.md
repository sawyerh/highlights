## Overview

Firebase is used for our database and serverless backend.

```mermaid
C4Container

   Boundary(firebase, "Firebase") {
      Boundary(functions, "Functions") {
         Component(handler, "handle{Collection}{Event}.ts")
         Component(api, "api.ts")
      }
      SystemDb(db, "Database", "Firestore")
   }

   Component_Ext(books, "Google Books")
   System_Ext(web, "Website", "/web")

   Rel(handler, books, "")
   Rel(web, api, "")
```

## Prerequisites

- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Java](https://www.oracle.com/java/technologies/downloads)

## 🐣 Creating a new Firebase project

1. Create a new Firebase project in the [Firebase console](https://console.firebase.google.com/).
1. Enable billing for your project.
1. Create a new Firestore database in the project, in production mode.
1. Add an app to the Firebase project: `firebase apps:create web <app name> --project <project id>`
1. Configure the app to use the Firebase project: `firebase use <project id>`

## 🧰 Local development

### Setup environment

**Non-Firebase services (Google Books) are live**, so you it's best to run tests against a test environment:

1. Setup a new Firebase project for testing following the steps above, or find an existing project by running `firebase projects:list`
1. Copy the Firebase app config: `firebase apps:sdkconfig --project <project-id>`
1. Paste the config JSON into `/secrets/test-app.json`.

### Environment variables:

- `AI_FUNCTION_URL`: `aws ssm get-parameter --name /Highlights/AiLambdaFunctionDomain --query Parameter.Value --output text`
- `AI_API_SECRET`: `aws ssm get-parameter --name /Highlights/Clients-Secret --query Parameter.Value --output text`

### Running the emulator

1. To run TypeScript compilation in watch-mode and the Firebase emulator with seeded data:
   ```
   npm run dev
   ```

### Testing

#### Run tests

```
npm test
```

In watch mode, you can view the Firebase emulator UI at http://localhost:4000:

```
npm run test:watch
```

If you don't see data in the emulator, but expect to, make sure the Firebase CLI is using the same project as the tests: `firebase use <project id>`

#### Exporting seed data

To update the DB seed data:

```
npm run emulators:export
```

#### Switching projects

To switch between a test project and production, use the `firebase` cli:

```
firebase use PROJECT-NAME
```

#### Non-HTTP functions

Run `npm run shell` to emulate an environment to test non-HTTP Functions.

You can [pass test data directly into the function](https://firebase.google.com/docs/functions/local-emulator).

For a Firestore function:

```js
handleVolumeCreate({ title: "Hello world" });
```

For an HTTP function, it's easiest to run `npm run dev` and then use the HTTP URL that's logged to the console.

## 🚀 Deployment

```
$ firebase login
$ firebase deploy
```

Deploys can specify a project or even a specific function, use the `--only` flag:

```
$ firebase deploy --project foo-bar --only functions:api
```

## 🕰️ Backups and Exports

Backups are not automated, however the entire database or a specific collection can be manually backed up using the [Firestore export tool](https://firebase.google.com/docs/firestore/manage-data/export-import). Backups are stored in Google Cloud Storage.

[View all backups in Google Cloud Console](https://console.cloud.google.com/firestore/databases/-default-/import-export).

### Downloading a backup

```sh
$ gcloud auth login
$ gsutil -m cp -r "gs://BUCKET_NAME_HERE/EXPORT_DIRECTORY_HERE" .
```

_The backup is in a LevelDB format, which is unfortunately not human-readable and there aren't many tools for converting it to a more readable format._

### Exporting

The easiest way to query and export from a backup is to first [import it into BigQuery](https://cloud.google.com/bigquery/docs/loading-data-cloud-firestore). **[Step-by-step instructions for exporting are here](./exporting.md)**.

## Other tips

### Storage

To remove a file from Google Storage, copy the `gs://` path of the object, then from the CLI:

```
gsutil rm gs://[BUCKET_NAME]/[OBJECT_NAME]
```
