# [highlights.sawyerh.com](https://highlights.sawyerh.com)

This is the public website for my reading highlights.

- Frameworks: Next.js, Tailwind
- API: Mix of Firebase and AWS Lambda Function URLs
- Hosting: Vercel
- Analytics: Google Analytics

## 📦 Getting started

```
npm install
```

### Local development

Local development runs against a local API endpoint by default. To disable the emulator integration when running locally, change the `FIREBASE_API_URL` environment variable in `.env.development`.

1. In the `firebase/functions` directory, start the local API and seed the DB:
   ```
   npm run dev
   ```
1. In the `web` directory and in a separate terminal, start the web app :
   ```
   npm run dev
   ```

This will start the website at http://localhost:3000.

## 🚀 Deployment

Auto-deploys on commits to `main` via a Vercel GitHub integration

### Requirements

- `AI_URL` environment variable must be set in the Vercel console
- `FIREBASE_API_URL` environment variable must be set in the Vercel console
