export type FreelancerCategory = {
  label: string;
  subcategories: readonly string[];
};

/* Category hierarchy sourced from the supplied SkillNode Categories workbook. */
const ALL_FREELANCER_CATEGORIES: readonly FreelancerCategory[] = [
  {
    label: "Graphic Design & Branding",
    subcategories: [
      "Logo & Brand Identity",
      "Print & Marketing Collateral",
      "Packaging & Label Design",
      "Menu, Catalogue & Price List Design",
      "Social Media Creatives",
      "Signage & Shopfront Design",
      "Presentation & Document Design",
      "Illustration & Custom Artwork",
      "Infographics & Data Visualisation",
      "UI / UX Design",
    ],
  },
  {
    label: "Web, App & Software Development",
    subcategories: [
      "Business Website Development",
      "E-commerce Store Setup",
      "Website Maintenance, Fixes & Migration",
      "Custom Web Application Development",
      "Mobile App Development",
      "No-Code Builds & Automation",
      "Landing Pages & Sales Funnels",
      "WhatsApp, Chatbot & Ordering Systems",
      "Software QA & Testing",
      "IT Support, Cloud & Security",
    ],
  },
  {
    label: "Digital Marketing & Growth",
    subcategories: [
      "Google Business Profile & Local SEO",
      "Search Engine Optimisation",
      "Paid Advertising (Google & Meta)",
      "Social Media Management",
      "Marketplace & Aggregator Listing Management",
      "WhatsApp, SMS & Email Marketing",
      "Influencer & UGC Marketing",
      "Marketing Strategy, Audit & Consulting",
      "Analytics, Tracking & Reporting",
    ],
  },
  {
    label: "Video & Animation",
    subcategories: [
      "Short-form & Reels Editing",
      "Product & Promotional Video",
      "Explainer & Animated Video",
      "Motion Graphics & VFX",
      "Long-form Video Editing",
      "Event & Wedding Video Editing",
      "3D Animation & Product Visualisation",
      "Subtitling, Captions & Video Localisation",
    ],
  },
  {
    label: "Audio & Music",
    subcategories: [
      "Voice Over & Narration",
      "Podcast Production & Editing",
      "Music Composition & Production",
      "Jingles & Audio Branding",
      "Mixing, Mastering & Audio Repair",
      "Dubbing & Audio Localisation",
      "Sound Design & SFX",
    ],
  },
  {
    label: "Writing, Translation & Content",
    subcategories: [
      "Website & Marketing Copy",
      "Product Descriptions & Catalogue Content",
      "Blog, SEO & Article Writing",
      "Social Media Content Writing",
      "Business & Technical Documentation",
      "Regional Translation & Localisation",
      "Transcription & Data Capture",
      "Script & Creative Writing",
      "Career & Personal Documents",
    ],
  },
  {
    label: "Business, Finance, Legal & Admin",
    subcategories: [
      "Accounting & Bookkeeping",
      "GST, Income Tax & Statutory Filing",
      "Company Formation & Compliance",
      "Legal Drafting & Intellectual Property",
      "Business Plans, Modelling & Funding Documents",
      "HR, Recruitment & Payroll Support",
      "Virtual Assistance & Back Office",
      "Data Entry, Cleanup & Processing",
      "Market & Customer Research",
    ],
  },
  {
    label: "Data, AI & Engineering Services",
    subcategories: [
      "Data Analysis & Dashboards",
      "AI Automation & Agent Builds",
      "Machine Learning & Data Science",
      "CAD, Engineering & Product Design",
      "Architecture, Interior & 3D Visualisation",
      "Jewellery CAD & Design",
      "Fashion & Textile Design",
    ],
  },
  {
    label: "On-site Creative Production",
    subcategories: [
      "Product & Catalogue Photography",
      "Food & Restaurant Photography",
      "Commercial Videography & Shoot Days",
      "Event & Corporate Coverage",
      "Real Estate, Interior & Drone",
      "Personal & Social Photography",
      "Photo Editing & Post-production",
    ],
  },
  {
    label: "Retail, Brand & Field Services",
    subcategories: [
      "Signage, Shopfront & Fabrication Coordination",
      "Print Production Management",
      "Visual Merchandising & Store Styling",
      "Exhibition, Stall & Pop-up Setup",
      "Field Marketing & Activation Staffing",
      "Mystery Shopping & Field Audits",
      "On-site IT & Office Setup",
      "Local Sales & Lead Generation Field Work",
    ],
  },
  {
    label: "Events, Hospitality & Occasions",
    subcategories: [
      "Event Planning & Coordination",
      "Decor & Theme Setup",
      "Beauty & Styling for Occasions",
      "Performers & Entertainment",
      "Catering & Culinary Services (labour only)",
      "Event Support Staffing",
    ],
  },
  {
    label: "Home, Care & Personal Services",
    subcategories: [
      "Home Organisation & Setup",
      "Tutoring & Skill Classes",
      "Care & Companion Services",
      "Health, Fitness & Wellness",
      "Pet Services",
    ],
  },
  {
    label: "Custom Making, Craft & Personalisation",
    subcategories: [
      "Custom Gift Design & Personalisation",
      "Invitation, Calligraphy & Stationery Design",
      "Cake, Dessert & Confectionery Artistry",
      "Floral Design & Arrangements",
      "Handmade Craft & Artisan Goods",
      "Custom Furniture & Interior Woodwork Design",
      "Portrait, Caricature & Commissioned Art",
      "Personalisation, Engraving & Print-on-Demand",
    ],
  },
] as const;

/*
 * Categories currently shown on the landing page.
 * Uncomment a category below whenever it is ready to be added to the campaign.
 */
const ACTIVE_FREELANCER_CATEGORY_LABELS: readonly string[] = [
  "Graphic Design & Branding",
  "Web, App & Software Development",
  "Digital Marketing & Growth",
  "Video & Animation",
  "Audio & Music",
  "Writing, Translation & Content",
  // "Business, Finance, Legal & Admin",
  // "Data, AI & Engineering Services",
  // "On-site Creative Production",
  // "Retail, Brand & Field Services",
  // "Events, Hospitality & Occasions",
  // "Home, Care & Personal Services",
  // "Custom Making, Craft & Personalisation",
];

export const FREELANCER_CATEGORIES: readonly FreelancerCategory[] =
  ALL_FREELANCER_CATEGORIES.filter((category) =>
    ACTIVE_FREELANCER_CATEGORY_LABELS.includes(category.label),
  );

export function findFreelancerCategory(label: string) {
  return FREELANCER_CATEGORIES.find((category) => category.label === label);
}
