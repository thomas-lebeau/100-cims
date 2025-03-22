# 💯⛰️ 100 Cims

A Next.js application for tracking mountain summit climbs in Catalonia.


## 📋 Overview

100 Cims is a web application that helps hikers track their progress climbing the 100 most significant mountain summits of Catalonia, with Strava integration for automatic activity tracking.

## 🚀 Getting Started

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example` for required variables)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## 🗄️ Database

The application uses Supabase with Prisma as an ORM.

### Updating the database schema

1. Edit the schema in `prisma/schema.prisma`
2. Run `npx prisma db push` to update the database schema
3. Run `npx prisma generate` to generate the Prisma client
4. Restart the development server

### Seeding the database

To reset the database and seed it with initial data for `Cim` and `Comarca` tables:

```bash
npx prisma db seed
```

> [!WARNING] 
> This will delete all existing data in the database!

## 🔄 Strava Integration

The app uses Strava's API to fetch activity data and webhooks to keep user activities up to date.

> [!NOTE]
>  Strava allows only one authorization callback domain per app and one app per account. Separate Strava accounts (and apps) are used for development and production.

- [Strava Dashboard](https://www.strava.com/settings/api)
- [Webhook Events API](https://developers.strava.com/docs/webhooks/) documentation.

### Managing Strava Webhooks

Use the github action `setup-strava-webhooks` to manage the Strava webhooks.

<details>
<summary>Alternative commands</summary>

#### View subscription

```bash
curl -sS -G https://www.strava.com/api/v3/push_subscriptions \
    -d client_id=${STRAVA_CLIENT_ID} \
    -d client_secret=${STRAVA_CLIENT_SECRET} | jq '.[] | .id'
```

#### Create subscription (local development)
```bash
curl -sS http://127.0.0.1:4040/api/tunnels \
| jq -r '.tunnels[0].public_url' \
| xargs -I {} \
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
    -F client_id=${STRAVA_CLIENT_ID} \
    -F client_secret=${STRAVA_CLIENT_SECRET} \
    -F verify_token=${STRAVA_VERIFY_TOKEN} \
    -F callback_url={}/api/strava/webhook
```

#### Create subscription (production)
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
    -F client_id=${STRAVA_CLIENT_ID} \
    -F client_secret=${STRAVA_CLIENT_SECRET} \
    -F verify_token=${STRAVA_VERIFY_TOKEN} \
    -F callback_url=https://100-cims.vercel.app/api/strava/webhook
```

#### Delete subscription
```bash
curl -sS -G https://www.strava.com/api/v3/push_subscriptions \
    -d client_id=${STRAVA_CLIENT_ID} \
    -d client_secret=${STRAVA_CLIENT_SECRET} \
| jq '.[] | .id' \
| xargs -I {} \
curl -X DELETE \
    "https://www.strava.com/api/v3/push_subscriptions/{}?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}"
```
</details>

## 📊 Admin Dashboards

- [Strava API Dashboard](https://www.strava.com/settings/api)
- [Supabase Dashboard](https://supabase.com/dashboard/projects)
- [Vercel Dashboard](https://vercel.com/thomas-lebeau/100-cims)
- [Ngrok Dashboard](https://dashboard.ngrok.com/tunnels/agents)
- [Datadog Dashboard](https://app.datadoghq.eu/rum/performance-monitoring)

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

Interactive UI mode:
```bash
npm run e2e:ui
```

## 📄 License

This project is licensed under the terms found in the [LICENSE](LICENSE) file.
