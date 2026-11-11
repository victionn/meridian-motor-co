/**
 * Single source of truth for business details and navigation.
 * Move to the headless CMS once one is chosen (see docs/ARCHITECTURE.md).
 */
export const site = {
  name: "Meridian Motor Co",
  tagline: "Prestige, performance and classic cars — curated in Sydney.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  established: 2011,

  phone: { display: "(02) 9715 6577", href: "tel:+61297156577" },
  email: "enquiries@meridianmotorco.com.au",

  showroom: {
    street: "13 Sirius Road",
    suburb: "Lane Cove West",
    state: "NSW",
    postcode: "2066",
    hours: [{ days: "Mon – Sun", time: "9:00am – 5:30pm" }],
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=13+Sirius+Road+Lane+Cove+West+NSW+2066",
  },

  service: {
    name: "Meridian Garage",
    phone: { display: "(02) 9198 0928", href: "tel:+61291980928" },
    email: "enquiries@meridiangarage.com.au",
    hours: [
      { days: "Mon – Fri", time: "8:00am – 5:00pm" },
      { days: "Sat – Sun", time: "Closed" },
    ],
  },

  social: {
    instagram: "https://www.instagram.com/meridianmotorco/",
    // Posts shown on the home page until INSTAGRAM_ACCESS_TOKEN is set (then the latest posts load automatically).
    // Newest first; replace these links to change what's shown.
    instagramPosts: [
      "https://www.instagram.com/p/DdVaEMgmq1l/",
      "https://www.instagram.com/p/DZrZIJZGS7X/",
      "https://www.instagram.com/p/DZL78mTGYIC/",
      "https://www.instagram.com/p/DYoJ12uGX7l/",
    ],
    facebook: "https://www.facebook.com/meridianmotorco/",
  },

  finance: {
    // Indicative only — confirm with the finance team before launch.
    comparisonRate: 8.99,
    defaultTermMonths: 60,
    defaultDepositPct: 10,
    disclaimer:
      "Estimate only. Based on the rate shown, excludes fees and charges, and is subject to lender approval. Not a quote or offer of finance.",
  },

  // Buyer assurances shown on each car's page. These mirror what meridianmotorco.com.au states for every
  // "Meridian Certified" car — don't add a promise here (returns, free delivery, included warranty) the business doesn't make.
  assurances: [
    { id: "inspected", label: "Certified inspected" },
    { id: "detailed", label: "Professionally detailed" },
    { id: "warranty", label: "Extended warranty available" },
    { id: "delivery", label: "Interstate delivery available" },
  ],

  // Review ratings shown on the home page banner. Keep these in step with the live figures on each platform.
  // `note` is the bracketed review count for Google and the recommendation rate for Facebook.
  reviews: [
    { source: "Google", rating: 4.6, note: "(416)", href: "https://www.google.com/maps/search/?api=1&query=Meridian+Motor+Co+Lane+Cove+West" },
    { source: "Facebook", rating: 4.5, note: "94% recommended", href: "https://www.facebook.com/meridianmotorco/reviews" },
  ],

  // Customer testimonials shown on the home page, below the social feed. Real reviews only, quoted word for word.
  // Names are first name plus the surname's initial.
  // `source` picks the logo on the card. Google reviews carry a star `rating`; Facebook ones are recommendations
  // with no stars, so leave `rating` off. `detail` (e.g. the car bought) is optional.
  // `image` is optional: a photo in public/testimonials/ (with `imageAlt` describing it).
  // `imagePosition` (a CSS object-position) picks which part of a tall photo shows in the 3:2 frame.
  testimonials: [
    {
      name: "Hubert S.",
      source: "Google",
      detail: "Bentley owner",
      rating: 5,
      quote:
        "Anthony provided the best experience I have ever had in my many years of buying used cars. He was an absolute professional in the negotiations and the delivery of my Bentley. I can not recommend Anthony highly enough for your next luxury car purchase.",
      image: "/testimonials/hubert-s.jpg",
      imageAlt: "Two customers beside a white Bentley Continental with a red bow on the bonnet in the showroom",
    },
    {
      name: "Bundy B.",
      source: "Google",
      detail: "BMW owner, Queensland",
      rating: 5,
      quote:
        "Buying a car from interstate can be difficult. Thankfully Adarsh and Anthony made the purchase of my latest vehicle very smooth and easy. On my first visit to Sydney I was able to view and drive the car, as well as request some minor cosmetic work be attended to. On my second visit I simply drove in with my trade and over the next 2 days drove my new dream car back to Queensland. Loving it. Thanks guys, I hope I'll be back one day.",
      image: "/testimonials/bundy-b.jpg",
      imageAlt: "A dark blue BMW with a red bow on the bonnet in the showroom, beside a congratulations sign",
    },
    {
      // First sentence of a longer review.
      name: "Neil",
      source: "Google",
      detail: "Jeep owner",
      rating: 5,
      quote:
        "From first contact about the car we wanted to buy George has been 100% transparent, even sending 3 videos showing the car, plus numerous photos allowing us to close the deal with confidence.",
      image: "/testimonials/neil.jpg",
      imageAlt: "A customer standing beside a red Jeep Grand Cherokee SRT with a red bow on the bonnet in the showroom",
    },
    {
      name: "Vanessa S.",
      source: "Google",
      detail: "Land Rover owner",
      rating: 5,
      quote:
        "My partner Liam and I purchased a Land Rover Discovery Sport and had the pleasure of dealing with Mistral. Mistral was the ultimate professional and her regular communication and updates regarding the purchase of our car was truly appreciated. I would not hesitate to deal with Mistral and Meridian Motor Co again. We thoroughly enjoyed our experience. Keep up the good work Mistral and Meridian Motor Co. Thanks - Vanessa and Liam",
      image: "/testimonials/vanessa-s.jpg",
      imageAlt: "Two customers standing beside a red Land Rover Discovery Sport with a red bow on the bonnet",
    },
    {
      name: "Nikolas A.",
      source: "Google",
      rating: 5,
      quote:
        "Absolutely seamless experience. Purchased a car for my elderly father. The whole experience from start to finish was really good. They handled the trade-in, swapping of plates & made my dad feel really comfortable. Thank you Meridian. We'll definitely be back again.",
    },
    {
      name: "Vivian N.",
      source: "Google",
      rating: 5,
      quote:
        "I had a great experience purchasing my car with Adarsh. He was very professional and was very helpful throughout the whole process. The customer service and service offering at Meridian motor is amazing, they go above and beyond. I would recommend this car dealership to my friends and family!!",
      image: "/testimonials/vivian-n.jpg",
      imageAlt: "A car under a red satin cover in the showroom, waiting to be unveiled, beside a congratulations sign",
      imagePosition: "center 75%",
    },
    {
      name: "Roy G.",
      source: "Facebook",
      quote:
        "Just want to mention how happy we were with our time at Meridian foremost with the hospitality service and knowledge of product shown to us by Lee. Nothing was a problem, moving cars answering questions and above all making our experience at Meridian a pleasant one. Lee also makes a great cup of coffee , definately an asset to the business 😊",
    },
    {
      name: "Jason H.",
      source: "Facebook",
      quote:
        "I enjoyed the knowledge, the personable interaction with staff and the quality of vehicles on offer. I drove away very satisfied with my vehicle and the assurance of extensive selection processes in place to acquire a reliable second hand luxury car. 🌟🌟🌟🌟🌟",
    },
  ] as { name: string; source: "Google" | "Facebook"; detail?: string; rating?: number; quote: string; image?: string; imageAlt?: string; imagePosition?: string }[],

  /** Slug of the car given the full-width feature at the top of the showroom (omit to show none). */
  showroomFeature: "1989-ferrari-testarossa-13171" as string | undefined,

  // Menu links shown in the header's menu panel. Add { label, href } entries as pages are built.
  nav: [{ label: "Showroom", href: "/cars" }] as { label: string; href: string }[],
} as const;

export type Site = typeof site;
