Hello 👋 You're at the root of a monorepo. Within this repo are several different packages:

| Name                                                             | Description                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`kindle-email-to-json`](packages/kindle-email-to-json/)         | Converts an email export of Kindle notes into a JSON object.<br>[![kindle-email-to-json](https://img.shields.io/npm/v/kindle-email-to-json.svg)](https://www.npmjs.com/package/sawyerh/kindle-email-to-json)                                                                                                              |
| [`kindle-clippings-to-json`](packages/kindle-clippings-to-json/) | Convert an email including Kindle clippings into a JSON object.<br>[![kindle-clippings-to-json](https://img.shields.io/npm/v/kindle-clippings-to-json.svg)](https://www.npmjs.com/package/sawyerh/kindle-clippings-to-json)                                                                                               |
| [`highlights-email-to-json`](packages/highlights-email-to-json/) | Converts an email of plain text notes into a JSON object. You can use this for a lot of things — I primarily use it as a way to import Instapaper highlights.<br>[![highlights-email-to-json](https://img.shields.io/npm/v/highlights-email-to-json.svg)](https://www.npmjs.com/package/sawyerh/highlights-email-to-json) |
| [`safari-books-csv-to-json`](packages/safari-books-csv-to-json/) | Converts an email attachment consisting of an O'Reilly Safari Books CSV highlights export into a JSON object.<br>[![safari-books-csv-to-json](https://img.shields.io/npm/v/safari-books-csv-to-json.svg)](https://www.npmjs.com/package/sawyerh/safari-books-csv-to-json)                                                 |
| [Email Handler](packages/aws-lambda-email-handler/)              | An AWS Lambda function for handling the receiving of an email export                                                                                                                                                                                                                                                      |
| [SMS Handler](packages/aws-lambda-email-handler/)                | An AWS Lambda function for sending a daily SMS of a random highlight                                                                                                                                                                                                                                                      |

**For more background about this project, [read this blog post](https://medium.com/@sawyerh/how-i-export-process-and-resurface-my-kindle-highlights-addc9de9af1a).**

## System diagram

```mermaid
C4Context
    Person(me, "Me")

    Container_Boundary(aws, "AWS") {
        System(ses, "SES")
        SystemDb(s3, "S3")
        System(lambda, "Lambda")
    }

    Container_Boundary(google, "Google Cloud") {
        Container_Boundary(firebase, "Firebase") {
            System(functions, "Cloud Functions")
            SystemDb(firestore, "Firestore")
        }

        Component(nl, "Natural Language API")
    }

    Container_Boundary(vercel, "Vercel") {
        System(web, "Website")
    }

    Component(books, "Google Books API")

    Rel(me, ses, "Emails export")
    Rel(ses, s3, "Saves email as file")
    Rel(s3, lambda, "Triggers serverless function")
    Rel(lambda, firestore, "Creates records")

    Rel(firestore, functions, "Triggers onCreate / onUpdate")
    Rel(functions, books, "Get book details and cover")
    Rel(functions, nl, "Analyze highlight text")

    Rel(web, functions, "HTTPS endpoints")
```
