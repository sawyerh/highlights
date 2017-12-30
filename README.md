Hello 👋 You're at the root of a monorepo. Within this repo are several different packages:

| Name | Description |
| ----------- | ------- |
| [`kindle-email-to-json`](packages/kindle-email-to-json/) | Converts an email export of Kindle notes into a JSON object.<br>[![kindle-email-to-json](https://img.shields.io/npm/v/kindle-email-to-json.svg)](https://www.npmjs.com/package/sawyerh/kindle-email-to-json) |
| [`highlights-email-to-json`](packages/highlights-email-to-json/) | Converts an email of plain text notes into a JSON object. You can use this for a lot of things — I primarily use it as a way to import Instapaper highlights.<br>[![highlights-email-to-json](https://img.shields.io/npm/v/highlights-email-to-json.svg)](https://www.npmjs.com/package/sawyerh/highlights-email-to-json) |
| [Email Handler](packages/highlights-lambda/) | An AWS Lambda function for handling the receiving of an email export |

**For more background about this project, [read this blog post](https://medium.com/@sawyerh/how-i-m-exporting-my-highlights-from-the-grasps-of-ibooks-and-kindle-ce6a6031b298).**
