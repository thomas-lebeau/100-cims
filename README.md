This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

### Schema updates

1. Make changes to the schema in `prisma/schema.prisma`
2. Create a branch in planetscale [dashboard](https://app.planetscale.com/lebeau-thomas/100-cims)
3. Run `npx prisma generate`
4. Run `npx prisma db push`
5. Merge and deploy the branch in planetscale

## Strava Webhook

### Prerequisites

- load env variables (e.g. `source .env`)
- [jq](https://stedolan.github.io/jq/download/) to parse json
- [ngrok](https://ngrok.com/download) to test locally (_optional_)

### View subsciptions

```bash
curl -sS -G https://www.strava.com/api/v3/push_subscriptions \
    -d client_id=${STRAVA_CLIENT_ID} \
    -d client_secret=${STRAVA_CLIENT_SECRET} | jq '.[] | .id'
```

### Create subscription

<details open>
<summary>local</summary>

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

</details>

<details>
<summary>production</summary>

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
    -F client_id=${STRAVA_CLIENT_ID} \
    -F client_secret=${STRAVA_CLIENT_SECRET} \
    -F verify_token=${STRAVA_VERIFY_TOKEN} \
    -F callback_url=https://100cims.vercel.app/api/strava/webhook
```

</details>

### Delete subscription

```bash
curl -sS -G https://www.strava.com/api/v3/push_subscriptions \
    -d client_id=${STRAVA_CLIENT_ID} \
    -d client_secret=${STRAVA_CLIENT_SECRET} \
| jq '.[] | .id' \
| xargs -I {} \
curl -X DELETE \
    "https://www.strava.com/api/v3/push_subscriptions/{}?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
