/* ============================================================
   HOOKED BY ESTHER - EDIT THIS FILE TO MAKE THE SITE YOURS
   Prices, contact details and the chat assistant's answers
   all live here. No coding needed: just change the text.
   ============================================================ */
const SITE = {
  business: "Hooked by Esther",
  currency: "$",                       // change to £, €, R, etc.
  whatsapp: "15555550123",             // PLACEHOLDER: country code + number, digits only
  email: "hello@example.com",          // PLACEHOLDER
  instagram: "https://instagram.com/", // PLACEHOLDER
  facebook: "https://facebook.com/",   // PLACEHOLDER
  stripePaymentLink: ""                // Add a Stripe Payment Link such as https://buy.stripe.com/...
};

/* Product catalogue. Replace photos or copy here to update the collection. */
const PRODUCTS = [
  { name:"Cosy Throw Blanket", cat:"Blankets", photo:"assets/blanket.webp",
    desc:"A textured, generous throw for slow evenings.", materials:"Soft wool blend", fibre:"Wool-acrylic blend", size:"Custom, approximately 120 × 150 cm", care:"Hand wash cool; dry flat", allergens:"Wool fibres", price:85 },
  { name:"Cot Blanket", cat:"Baby", photo:"assets/yarn.webp",
    desc:"A gentle first blanket with a soft scalloped edge.", materials:"Baby-soft cotton", fibre:"100% cotton", size:"Custom, approximately 70 × 90 cm", care:"Gentle machine wash cold; dry flat", allergens:"None specified", price:60 },
  { name:"Slouchy Beanie", cat:"Hats", photo:"assets/hat.webp",
    desc:"A warm ribbed hat made for everyday wear.", materials:"Merino blend", fibre:"Merino and acrylic blend", size:"Adult; 54–58 cm head circumference", care:"Hand wash cool; dry flat", allergens:"Merino wool", price:28 },
  { name:"Chunky Scarf", cat:"Scarves", photo:"assets/scarf.webp",
    desc:"Long and squishy, with room to wrap twice.", materials:"Chunky wool blend", fibre:"Wool-acrylic blend", size:"Custom, approximately 180 × 30 cm", care:"Hand wash cool; dry flat", allergens:"Wool fibres", price:35 },
  { name:"Market Tote", cat:"Bags", photo:"assets/bag.webp",
    desc:"A sturdy crocheted tote for markets and weekends.", materials:"Cotton cord", fibre:"Recycled cotton cord", size:"Custom, approximately 38 × 42 cm", care:"Spot clean or gentle hand wash", allergens:"None specified", price:42 },
  { name:"Baby Set", cat:"Baby", photo:"assets/knitting.webp",
    desc:"A small matching set for a new arrival.", materials:"Soft cotton", fibre:"Cotton baby yarn", size:"Newborn to 6 months", care:"Gentle machine wash cold; dry flat", allergens:"None specified", price:32 },
  { name:"Amigurumi Friends", cat:"Amigurumi", photo:"assets/toys.webp",
    desc:"A huggable handmade friend, made to keep.", materials:"Cotton yarn, fibrefill", fibre:"Cotton yarn and polyester fibrefill", size:"Approximately 25 cm", care:"Surface clean; keep away from moisture", allergens:"Polyester fibrefill", price:30 },
  { name:"Made-to-Imagine", cat:"Amigurumi", photo:"assets/hero-craft.webp",
    desc:"Send a drawing or favourite animal to begin.", materials:"Cotton yarn, fibrefill", fibre:"Cotton yarn and polyester fibrefill", size:"Custom; confirmed before making", care:"Surface clean; keep away from moisture", allergens:"Polyester fibrefill", price:"from 45" }
];

/* Chat assistant knowledge base. "keys" are words that trigger an answer. */
const CHAT = {
  greeting: "Hi, I'm Esther's little helper! Ask me about my pieces, prices, delivery or how to look after your crochet.",
  fallback: "Hmm, I'm not sure about that one. Message Esther directly on WhatsApp and she'll answer personally. Or try one of the buttons below.",
  chips: ["Custom order","Track order","Prices","Delivery","Care tips"],
  answers: [
    { keys:["track","tracking","status","order number"],
      text:"Enter your HBE order number in the Track an order section, or ask me with it in a message—for example: What is the status of HBE-261122-ABCD?" },
    { keys:["custom","order","how do i","start","make me","commission"],
      text:"Custom orders are easy:\n1. Choose a piece from the shop.\n2. Tell me your colours, size and deadline.\n3. I confirm the price and date, then make it.\nUse the order form at the bottom of the page or message me on WhatsApp." },
    { keys:["price","cost","how much","pricing","expensive"],
      text:"Here are my starting prices (samples, I confirm the final price once I know your size and colours):\n• Blankets from {c}60\n• Hats {c}28 · Scarves {c}35\n• Bags {c}42\n• Baby sets {c}32\n• Amigurumi from {c}30" },
    { keys:["deliver","delivery","shipping","post","ship","pickup","collect"],
      text:"Delivery options and rates are confirmed when we discuss your piece. I can arrange local pickup or tracked posting, and every order is wrapped carefully." },
    { keys:["long","time","turnaround","ready","when","wait","deadline","rush"],
      text:"Most pieces take 1 to 3 weeks. Small items like hats and toys are quicker. Big blankets take longer. Need it by a date? Tell me and I'll say if I can do it." },
    { keys:["care","wash","clean","dry","look after","shrink","iron"],
      text:"Care tips:\n• Hand wash cool with gentle soap\n• Don't wring or twist\n• Dry flat, away from heat\n• Machine wash only if labelled machine washable, in a mesh bag on a delicate cycle." },
    { keys:["product","make","sell","blanket","hat","scarf","bag","baby","amigurumi","toy","knit","sew"],
      text:"I crochet, knit and sew blankets, hats, scarves, bags, baby items and amigurumi toys. Have something else in mind? Ask, I love a new challenge." },
    { keys:["colour","color","size","yarn","material"],
      text:"Almost everything can be made in your colours and size. I use soft acrylic-wool blends, cotton and merino. Tell me about any allergies or preferences." },
    { keys:["contact","whatsapp","email","reach","talk"],
      text:"Easiest is WhatsApp (button in the order section). You can also email me or use the form on this page." },
    { keys:["hi","hello","hey","hiya"], text:"Hello! What can I help you with today?" },
    { keys:["thank","thanks"], text:"You're so welcome! Happy to help." }
  ]
};
