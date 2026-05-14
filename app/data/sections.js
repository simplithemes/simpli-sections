export const SECTION_CATALOG = [
  // FREE SECTIONS
  {
    handle: "announcement_bar",
    title: "Announcement Bar",
    description:
      "Add a premium announcement bar for offers, shipping updates, store messages, and campaigns.",
    hook: "Share important offers instantly above the fold.",
    whyThisMatters:
      "Most shoppers decide quickly whether to stay or leave. A clear announcement bar helps you highlight offers, shipping updates, urgency messages, or store-wide campaigns right at the top — increasing visibility without disturbing the shopping experience.",
    useCases: ["Store announcements", "Sale messages", "Shipping updates"],
    price: 0,
    status: "live",
    category: "conversion",
    block: "announcement_bar",
    tags: ["Free", "Starter", "New"],
    placement: "Homepage / Product Page",
    type: "free",
    image: "/section-previews/announcement-bar.png",
  },
  {
    handle: "trust_badges",
    title: "Trust Badges",
    description:
      "Show secure payment, shipping, returns, and quality trust signals in a clean layout.",
    hook: "Build buyer trust before checkout.",
    whyThisMatters:
      "First-time visitors do not trust a store instantly. Trust badges reduce hesitation by showing secure payment, delivery assurance, return confidence, and quality signals before the customer reaches checkout.",
    useCases: ["Secure checkout", "Delivery promise", "Easy returns"],
    price: 0,
    status: "live",
    category: "trust",
    block: "trust_badges",
    tags: ["Free", "Trust", "Social Proof"],
    placement: "Product Page / Cart",
    type: "free",
    image: "/section-previews/trust-badges.png",
  },
  {
    handle: "product_page_accordion",
    title: "Product Page Accordion",
    description:
      "Add expandable product details, FAQs, shipping information, return details, or support content.",
    hook: "Answer buyer doubts without cluttering the product page.",
    whyThisMatters:
      "Customers often leave when important answers are hard to find. Product accordions keep FAQs, shipping details, returns, ingredients, sizing, and product information organized so shoppers can resolve doubts without leaving the page.",
    useCases: ["Product FAQs", "Shipping info", "Return policy", "Product details"],
    price: 0,
    status: "live",
    category: "product-page",
    block: "product_page_accordion",
    tags: ["Free", "Support", "Product Page"],
    placement: "Product Page / Homepage",
    type: "free",
    image: "/section-previews/product-page-accordion.png",
  },
  {
    handle: "testimonials_carousel",
    title: "Testimonials Carousel",
    description:
      "Show customer testimonials in a premium scrollable carousel layout.",
    hook: "Turn customer feedback into trust-building proof.",
    whyThisMatters:
      "Shoppers trust real customer experiences more than brand claims. A testimonial carousel adds social proof across your store, helping new visitors feel more confident before buying.",
    useCases: ["Homepage reviews", "Product proof", "Brand credibility"],
    price: 0,
    status: "live",
    category: "trust",
    block: "testimonials_carousel",
    tags: ["Free", "Social Proof", "New"],
    placement: "Homepage / Product Page",
    type: "free",
    image: "/section-previews/testimonials-carousel.png",
  },
  {
    handle: "featured_collection_3",
    title: "Featured Collection",
    description:
      "Display selected collection products in a premium grid or mobile-friendly carousel layout.",
    hook: "Showcase bestsellers and featured products beautifully.",
    whyThisMatters:
      "Visitors need direction when browsing. A featured collection helps you push bestsellers, new arrivals, trending products, or high-margin items in a clean layout that improves product discovery.",
    useCases: ["Featured products", "Bestsellers", "New arrivals", "Collection highlights"],
    price: 0,
    status: "live",
    category: "product-page",
    block: "featured_collection_3",
    tags: ["Free", "Product Discovery", "New"],
    placement: "Homepage / Product Page",
    type: "free",
    image: "/section-previews/featured-collection-3.png",
  },

  // PREMIUM SECTIONS
  {
    handle: "bundle_builder",
    title: "Bundle Builder",
    description:
      "Let customers create product bundles and increase average order value with a guided buying layout.",
    hook: "Increase AOV by helping shoppers build bundles.",
    whyThisMatters:
      "Customers are more likely to buy multiple products when the offer feels guided and valuable. Bundle Builder helps you increase average order value by encouraging shoppers to create product combos, kits, or routines with clear savings.",
    useCases: ["Product bundles", "Buy together offers", "Routine kits"],
    price: 19,
    status: "live",
    category: "bundles",
    block: "bundle_builder",
    tags: ["Premium", "AOV Boost", "High Converting", "Trending"],
    placement: "Product Page / Cart",
    type: "premium",
    image: "/section-previews/bundle-builder.png",
  },
  {
    handle: "pack_selector",
    title: "Pack Selector",
    description:
      "Show quantity packs such as pack of 1, 2, 3, or 4 with discount labels and one-click cart action.",
    hook: "Push higher quantity purchases with clear pack options.",
    whyThisMatters:
      "Many shoppers are willing to buy more when the value is easy to understand. Pack Selector makes quantity offers clear, helping you promote larger packs, better savings, and higher cart value without confusing the customer.",
    useCases: ["Pack offers", "Quantity offers", "Buy more save more", "AOV boost"],
    price: 19,
    status: "live",
    category: "conversion",
    block: "pack_selector",
    tags: ["Premium", "AOV Boost", "High Converting"],
    placement: "Product Page",
    type: "premium",
    image: "/section-previews/pack-selector.png",
  },
  {
    handle: "frequently_bought_together",
    title: "Frequently Bought Together",
    description:
      "Let customers add related products together in one click with a premium product selector.",
    hook: "Increase cart value with smart product pairing.",
    whyThisMatters:
      "Customers often need help discovering complementary products. Frequently Bought Together makes cross-sells feel natural by suggesting related items at the right moment, increasing cart value with minimal friction.",
    useCases: ["Related products", "Cross-sells", "Complete the set"],
    price: 19,
    status: "live",
    category: "bundles",
    block: "frequently_bought_together",
    tags: ["Premium", "AOV Boost", "High Converting"],
    placement: "Product Page",
    type: "premium",
    image: "/section-previews/frequently-bought-together.png",
  },
  {
    handle: "video_carousel",
    title: "Video Carousel",
    description:
      "Show product videos, UGC clips, reels, demos, or customer proof in a premium swipeable video carousel.",
    hook: "Use video proof to increase product confidence.",
    whyThisMatters:
      "Static images do not always explain the product clearly. Video Carousel lets you show demos, UGC, reviews, transformations, and product usage in a swipeable format that builds confidence and keeps shoppers engaged.",
    useCases: ["UGC videos", "Product demos", "Customer proof", "Reels-style showcase"],
    price: 19,
    status: "live",
    category: "product-page",
    block: "video_carousel",
    tags: ["Premium", "Visual Proof", "Trending"],
    placement: "Homepage / Product Page",
    type: "premium",
    image: "/section-previews/video-carousel.png",
  },
  {
    handle: "size_chart_modal",
    title: "Size Chart Modal",
    description:
      "Add a clickable size chart popup for apparel, accessories, and size-based products.",
    hook: "Reduce size confusion before purchase.",
    whyThisMatters:
      "Sizing doubts create hesitation and returns. A size chart modal gives customers quick fit information without taking them away from the product page, helping them choose confidently.",
    useCases: ["Size guide", "Apparel pages", "Fit information"],
    price: 19,
    status: "live",
    category: "product-page",
    block: "size_chart_modal",
    tags: ["Premium", "Product Page", "Support"],
    placement: "Product Page",
    type: "premium",
    image: "/section-previews/size-chart-modal.png",
  },
  {
    handle: "smart_cart_goal_upsell",
    title: "Smart Cart Goal + Upsell",
    description:
      "Show a cart goal progress bar with an upsell product to increase cart value and unlock rewards.",
    hook: "Encourage customers to add more and unlock rewards.",
    whyThisMatters:
      "Customers are more likely to add extra items when they can see a clear reward threshold. Smart Cart Goal + Upsell uses progress, motivation, and relevant product suggestions to increase average order value inside the cart journey.",
    useCases: ["Free shipping goal", "Cart upsell", "Gift threshold", "AOV boost"],
    price: 19,
    status: "live",
    category: "cart",
    block: "smart_cart_goal_upsell",
    tags: ["Premium", "Cart", "AOV Boost", "High Converting"],
    placement: "Cart / Drawer / Product Page",
    type: "premium",
    image: "/section-previews/smart-cart-goal-upsell.png",
  },
  {
    handle: "sticky_add_to_cart",
    title: "Sticky Add To Cart",
    description:
      "Add a floating add-to-cart bar to keep the purchase CTA visible while customers scroll.",
    hook: "Keep the buy button visible on long product pages.",
    whyThisMatters:
      "On long product pages, customers often scroll far away from the main buy button. Sticky Add To Cart keeps the purchase action visible, especially on mobile, reducing friction when the shopper is ready to buy.",
    useCases: ["Product pages", "Long landing pages", "Mobile conversion"],
    price: 19,
    status: "live",
    category: "conversion",
    block: "sticky_add_to_cart",
    tags: ["Premium", "High Converting", "Mobile"],
    placement: "Product Page",
    type: "premium",
    image: "/section-previews/sticky-add-to-cart.png",
  },
  {
    handle: "pincode_checker",
    title: "Pincode Checker",
    description:
      "Add a pincode or ZIP delivery availability checker for product and landing pages.",
    hook: "Reduce delivery doubts before checkout.",
    whyThisMatters:
      "Delivery uncertainty can stop customers before checkout. Pincode Checker lets shoppers confirm serviceability, delivery availability, or shipping confidence early, reducing doubt and improving purchase intent.",
    useCases: ["Delivery check", "Pincode availability", "Shipping confidence"],
    price: 19,
    status: "live",
    category: "conversion",
    block: "pincode_checker",
    tags: ["Premium", "Conversion", "New"],
    placement: "Product Page",
    type: "premium",
    image: "/section-previews/pincode-checker.png",
  },
  {
    handle: "before_after_slider",
    title: "Before After Slider",
    description:
      "Show transformations, results, comparisons, or visual proof with an interactive draggable slider.",
    hook: "Show visible proof with an interactive comparison.",
    whyThisMatters:
      "Visual proof is powerful when customers need to see results before buying. Before After Slider helps you show transformations, comparisons, improvements, or product impact in a more convincing and interactive way.",
    useCases: ["Before-after results", "Product comparisons", "Transformation proof"],
    price: 19,
    status: "live",
    category: "product-page",
    block: "before_after_slider",
    tags: ["Premium", "Visual Proof", "New"],
    placement: "Product Page / Homepage",
    type: "premium",
    image: "/section-previews/before-after-slider.png",
  },
];

export const SECTION_CATEGORIES = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Conversion",
    value: "conversion",
  },
  {
    label: "Product Page",
    value: "product-page",
  },
  {
    label: "Cart",
    value: "cart",
  },
  {
    label: "Trust",
    value: "trust",
  },
  {
    label: "Bundles",
    value: "bundles",
  },
  {
    label: "Free",
    value: "free",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Trending",
    value: "trending",
  },
];