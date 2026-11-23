# Hooked by Esther

A small, responsive storefront for made-to-order crochet, knit and sewn pieces.

## Run locally

Install [Node.js](https://nodejs.org/) and start the built-in server:

```powershell
npm start
```

Open [http://localhost:4173](http://localhost:4173). Set `PORT` to use another port.

## Configure the site

Update `config.js` with the business contact details, social links, currency, product catalogue, and chat answers. Replace the sample contact details before publishing. Product photos and details are also configured there.

The current Stripe option requires a valid Stripe Payment Link in `SITE.stripePaymentLink`. A static payment link is not a complete checkout integration for custom-priced orders.

## Orders and tracking

The Node server accepts order requests at `/api/orders` and stores them in `orders.json` in the project directory. This file is ignored by Git because it contains customer information. Keep it private and back it up securely.

Order statuses are `placed`, `creating`, `done`, and `shipped`. Updating a status requires setting an `ADMIN_TOKEN` environment variable and sending it in the `x-admin-token` header with a `PATCH /api/orders/{order-number}` request. Do not expose the admin token in browser code.

## Before production

- Replace all placeholder business contact and social details.
- Replace sample product photos, prices, specifications, and testimonials with accurate information.
- Publish legally reviewed privacy, content, and refund policies appropriate for your location.
- Deploy behind HTTPS and use protected, durable order storage. The included JSON-file store is intended for a small local demo, not concurrent or production order processing.
- Configure and verify real payment checkout and shipping workflows before accepting orders.
