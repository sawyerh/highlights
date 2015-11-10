- [Installation](#installation)
- [Saving highlights](#saving-highlights)
- [Known issues](#known-issues)

# Installation

### Siteleaf

1. Create a new [Siteleaf](http://siteleaf.com) site
2. Create two collections, one for your "books" and another for your highlights. Take note of each collection's ID, which can be found in the URL after it's created.
3. Grab your API keys from your [account page](https://manage.siteleaf.com/account)
4. Using the ID's and Keys from steps 2 and 3, set your config variables in `siteleaf.config.js` (see `siteleaf.config.example.js`)

### AWS SES (and S3)

Setup AWS SES to store received email in an S3 bucket: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-setting-up.html

There are a couple ways you can set this up, but here's what I did:

Through my domain registar I created a specific subdomain for receiving my highlight emails (eg my-highlights.example.com) and [verified my domain](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-verification.html) using a TXT record.

![DNS Settings](https://github.com/sawyerh/highlights-email-to-lambda-to-siteleaf/blob/master/readme-images/dns.png)

In AWS SES I added my verified domain

![SES Settings](https://github.com/sawyerh/highlights-email-to-lambda-to-siteleaf/blob/master/readme-images/ses-1.png)

and created a rule set that would send my emails to S3 (you can create the bucket in this step if one doesn't already exist)

![SES Rule set](https://github.com/sawyerh/highlights-email-to-lambda-to-siteleaf/blob/master/readme-images/ses-2.png)

### AWS Lambda

Create a new [AWS Lambda](https://aws.amazon.com/documentation/lambda/) function using the code in this repo (you can upload it as a Zip).

![Lambda Settings](https://github.com/sawyerh/highlights-email-to-lambda-to-siteleaf/blob/master/readme-images/lambda.png)

After your Lambda function is created, add an event source to it that listens for Object Created events in S3. Now your Lambda function will be called anytime a new object is added to the S3 bucket you setup to store your emails.

![Lambda Settings](https://github.com/sawyerh/highlights-email-to-lambda-to-siteleaf/blob/master/readme-images/lambda-event.png)

# Saving Highlights

### iBooks

1. Go to the "Notes" tab
2. Click the "Share" icon
3. Email your highlights in the email's body

### Kindle

1. Install [this bookmarklet](https://github.com/cmenscher/kindleHighlightLiberator) and follow the instructions on the bookmarklet's page to export a JSON file with all Kindle highlights.
1. Email the `json` file from step 1 and/or `My Clippings.txt` (see below) as attachments
1. Never user the Kindle reader again.

**Don't see all of your highlights?** That's likely because you tried reading a book on your Kindle (or in the Kindle app) that wasn't purchased on Amazon. Yes, seriously. If you have a Kindle device, plug it into your computer and find `documents/My Clippings.txt`. If you're lucky, you'll find additional highlights in there. Never use the Kindle reader again.

### Readmill

1. Hopefully you downloaded the export file before they shut everything down on July 1, 2014.
2. Email `liked-highlights-data.json` and/or `reading-data.json` as attachments.

# Known issues

- Due to AWS Lambda functions having a maximum runtime of 5 minutes, if you're trying to save more than 100 highlights, it might timeout before fully saving all the highlights. If all highlights don't save the first time, re-send the email and it will pick up where it left off, only adding highlights that weren't added the first time.
