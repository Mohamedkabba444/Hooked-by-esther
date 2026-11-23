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

## Custom order requests

The order builder provides indicative size-based price and making-time estimates, yarn-colour swatches, payment preference and pickup/delivery choices. Esther should confirm the final price, delivery cost and schedule with the customer before work begins. Configure an actual Stripe link before offering online checkout.

Customers may attach one JPG, PNG or WebP inspiration photo up to 5 MB. The server stores it in `uploads/` and includes an unguessable, publicly accessible link in the WhatsApp message; anyone with that link may be able to view the photo. Establish a retention/deletion policy before collecting real customer photos.

## Product photo credits

The Cot Blanket, Baby Set and Made-to-Imagine photos are real Pexels photographs, used under the [Pexels License](https://www.pexels.com/license/), which permits free commercial use and does not require attribution:

- `assets/cot-blanket.jpg` — [momo@land, “Close-up of a folded, handmade crocheted blanket”](https://www.pexels.com/photo/a-rolled-crochet-blanket-6216236/)
- `assets/baby-set.jpg` — [Tilsa Tanaka, “Cozy still life of knitwear, baby booties, and dried flowers”](https://www.pexels.com/photo/knitted-fabrics-on-brown-wooden-round-stool-5360746/)
- `assets/custom-piece.jpg` — [Tailor Mia, “A cute crocheted teddy bear in pink dress”](https://www.pexels.com/photo/crocheted-soft-toy-12109904/)

These are illustrative stock photos, not photos of Esther's own finished orders. Replace them with Esther's product photos before treating them as a portfolio.

## Orders and tracking

The Node server accepts order requests at `/api/orders` and stores them in `orders.json` in the project directory. This file is ignored by Git because it contains customer information. Keep it private and back it up securely.

Order statuses are `placed`, `creating`, `done`, and `shipped`. Public tracking responses contain only the order number, status and item; customer contact details and delivery information are not exposed by the tracking endpoint. Updating a status requires setting an `ADMIN_TOKEN` environment variable and sending it in the `x-admin-token` header with a `PATCH /api/orders/{order-number}` request. Updates are disabled when no admin token is configured. Do not expose the admin token in browser code.

## Before production

- Replace all placeholder business contact and social details.
- Replace sample product photos, prices and specifications with accurate information, and use Esther's own product photos for portfolio listings.
- Publish legally reviewed privacy, content, and refund policies appropriate for your location.
- Deploy behind HTTPS and use protected, durable order storage. The included JSON-file store is intended for a small local demo, not concurrent or production order processing.
- Configure and verify real payment checkout and shipping workflows before accepting orders.
