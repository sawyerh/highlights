## Overview

Hello 👋 You're at the root of a monorepo.

This repo contains all of the code for my personal reading highlight system. You can read more about this project in [this blog post](https://sawyerh.medium.com/how-i-export-process-and-resurface-my-kindle-highlights-addc9de9af1a).

## Directory Structure

```
├── aws       # Email importer and AI/LLM features
├── firebase  # Database and backend
├── packages  # Reading export converters
│   ├── highlights-email-to-json
│   ├── kindle-clippings-to-json
│   ├── kindle-email-to-json
│   └── safari-books-csv-to-json
└── web       # Frontend
```

## Installation

### Pre-requisites

- Node.js 24 (see `.tool-versions`)
- Python 3.10+
- [poetry](https://python-poetry.org/docs/#installation)

### Setup top-level dependencies

To setup developer tooling, like linting and formatting:

```
make init
```

Then, each individual directory has its own README with setup instructions.

## System context

```mermaid
C4Context
  Person(me, "Me")

  Boundary(aws, "AWS") {
    System(ai, "Search & Summarization", "S3, Lambda")
    System(email, "Email importer", "SES, S3, Lambda")
  }

  Boundary(vercel, "Vercel") {
    System(web, "Web app", "Next.js")
  }

  Boundary(google, "Firebase") {
    SystemDb(db, "Database", "Firestore")
    System(functions, "Data enricher", "Cloud Functions")
    System(api, "API", "Cloud Functions")
  }

  System(ga, "Google Analytics")

  Rel(me, email, "Emails export")
  Rel(email, db, "Creates records")
  Rel(api, db, "Reads")
  Rel(web, api, "Get volumes and highlights")
  Rel(web, ai, "Search")
  Rel(web, ga, "Track")
  BiRel(db, functions, "Triggers updates")
  UpdateRelStyle(db, functions, $offsetX="-45", $offsetY="-20")

  UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="4")
```
