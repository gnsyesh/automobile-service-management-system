import { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "engine-oils",
    name: "Engine Oils",
    slug: "engine-oils",
    description: "Premium fully synthetic, semi-synthetic, and mineral engine oils for ultimate engine protection.",
    image: "https://images.unsplash.com/photo-1615900119311-654877f0a9ef?auto=format&fit=crop&q=80&w=800",
    iconName: "Droplet",
    subcategories: [
      { id: "fully-synthetic", name: "Fully Synthetic Oils", slug: "fully-synthetic" },
      { id: "semi-synthetic", name: "Semi-Synthetic Oils", slug: "semi-synthetic" },
      { id: "mineral-oils", name: "Mineral Engine Oils", slug: "mineral-oils" }
    ]
  },
  {
    id: "transmission-fluids",
    name: "Gear & Transmission Fluids",
    slug: "transmission-fluids",
    description: "Automatic Transmission Fluids (ATF), manual gear oils, and differential lubricants.",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
    iconName: "Settings",
    subcategories: [
      { id: "atf", name: "Automatic Transmission Fluids (ATF)", slug: "atf" },
      { id: "manual-gear", name: "Manual Transmission Oils", slug: "manual-gear" },
      { id: "differential", name: "Differential Lubricants", slug: "differential" }
    ]
  },
  {
    id: "brake-system",
    name: "Brake System",
    slug: "brake-system",
    description: "High-performance ceramic & metallic brake pads, ventilated discs, and DOT 4/5.1 brake fluids.",
    image: "https://images.unsplash.com/photo-1600706432520-22d73f91ef8d?auto=format&fit=crop&q=80&w=800",
    iconName: "Disc",
    subcategories: [
      { id: "brake-pads", name: "Brake Pads", slug: "brake-pads" },
      { id: "brake-discs", name: "Brake Discs & Rotors", slug: "brake-discs" },
      { id: "brake-fluids", name: "Brake Fluids", slug: "brake-fluids" },
      { id: "brake-shoes", name: "Brake Shoes", slug: "brake-shoes" }
    ]
  },
  {
    id: "filters",
    name: "Filters",
    slug: "filters",
    description: "OEM quality air, cabin carbon, oil spin-on, and fuel filter cartridges.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
    iconName: "Filter",
    subcategories: [
      { id: "oil-filters", name: "Oil Filters", slug: "oil-filters" },
      { id: "air-filters", name: "Air Filters", slug: "air-filters" },
      { id: "cabin-filters", name: "Cabin Air Filters", slug: "cabin-filters" },
      { id: "fuel-filters", name: "Fuel Filters", slug: "fuel-filters" }
    ]
  },
  {
    id: "ignition-electrical",
    name: "Ignition & Batteries",
    slug: "ignition-electrical",
    description: "Iridium spark plugs, heavy-duty AGM batteries, alternators, and ignition coils.",
    image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800",
    iconName: "Zap",
    subcategories: [
      { id: "spark-plugs", name: "Spark Plugs", slug: "spark-plugs" },
      { id: "batteries", name: "Car Batteries", slug: "batteries" },
      { id: "ignition-coils", name: "Ignition Coils", slug: "ignition-coils" },
      { id: "alternators", name: "Alternators", slug: "alternators" }
    ]
  },
  {
    id: "additives",
    name: "Additives & Performance",
    slug: "additives",
    description: "Engine flush treatments, fuel injector cleaners, oil stop-leak, and octane boosters.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    iconName: "FlaskConical",
    subcategories: [
      { id: "engine-additives", name: "Engine Additives", slug: "engine-additives" },
      { id: "fuel-additives", name: "Fuel Additives", slug: "fuel-additives" },
      { id: "oil-additives", name: "Oil Additives", slug: "oil-additives" }
    ]
  },
  {
    id: "coolants-fluids",
    name: "Coolants & Radiators",
    slug: "coolants-fluids",
    description: "Concentrated and pre-mixed G12/G13 radiator coolants, water pumps, and anti-freeze.",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
    iconName: "Thermometer",
    subcategories: [
      { id: "coolants", name: "Radiator Coolants", slug: "coolants" },
      { id: "water-pumps", name: "Water Pumps", slug: "water-pumps" },
      { id: "radiators", name: "Radiators", slug: "radiators" }
    ]
  },
  {
    id: "engine-belts",
    name: "Engine Belts & Timing",
    slug: "engine-belts",
    description: "Timing belt kits, serpentine belts, tensioner pulleys, and timing chains.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    iconName: "Wrench",
    subcategories: [
      { id: "timing-kits", name: "Timing Belt Kits", slug: "timing-kits" },
      { id: "belts", name: "V-Belts & Serpentine Belts", slug: "belts" }
    ]
  },
  {
    id: "suspension-steering",
    name: "Suspension & Steering",
    slug: "suspension-steering",
    description: "Gas-filled shock absorbers, coil springs, wheel bearings, and control arms.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    iconName: "Shield",
    subcategories: [
      { id: "shock-absorbers", name: "Shock Absorbers", slug: "shock-absorbers" },
      { id: "bearings", name: "Wheel Bearings", slug: "bearings" },
      { id: "suspension-parts", name: "Suspension Arms & Links", slug: "suspension-parts" }
    ]
  },
  {
    id: "tyres-wheels",
    name: "Tyres & Wheel Care",
    slug: "tyres-wheels",
    description: "All-season luxury tyres, performance sport tyres, wheel covers, and pressure gauges.",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800",
    iconName: "CircleDot",
    subcategories: [
      { id: "tyres", name: "Car Tyres", slug: "tyres" },
      { id: "wheel-accessories", name: "Wheel Covers & Accessories", slug: "wheel-accessories" }
    ]
  },
  {
    id: "lighting",
    name: "LED Headlights & Lighting",
    slug: "lighting",
    description: "Ultra-bright LED headlight conversion kits, fog lamps, DRL lights, and interior LEDs.",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800",
    iconName: "Lightbulb",
    subcategories: [
      { id: "led-headlights", name: "LED Headlights", slug: "led-headlights" },
      { id: "fog-lamps", name: "Fog Lamps", slug: "fog-lamps" }
    ]
  },
  {
    id: "interior-accessories",
    name: "Interior Accessories",
    slug: "interior-accessories",
    description: "Custom leather seat covers, 5D waterproof floor mats, phone mounts, and armrests.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
    iconName: "Car",
    subcategories: [
      { id: "floor-mats", name: "Floor Mats", slug: "floor-mats" },
      { id: "seat-covers", name: "Seat Covers", slug: "seat-covers" },
      { id: "phone-holders", name: "Phone Holders & Mounts", slug: "phone-holders" }
    ]
  },
  {
    id: "car-care",
    name: "Car Care & Detailing",
    slug: "car-care",
    description: "Ceramic spray coating, high-foaming car shampoo, Carnauba wax, leather conditioners, and microfiber cloths.",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800",
    iconName: "Sparkles",
    subcategories: [
      { id: "car-shampoo", name: "Car Shampoo & Foam", slug: "car-shampoo" },
      { id: "polish-wax", name: "Polish & Wax", slug: "polish-wax" },
      { id: "car-perfumes", name: "Luxury Car Air Fresheners", slug: "car-perfumes" },
      { id: "cleaning-products", name: "Cleaning Kits & Microfiber", slug: "cleaning-products" }
    ]
  },
  {
    id: "electronics",
    name: "Electronics & Gadgets",
    slug: "electronics",
    description: "4K Dual Dash Cameras, fast wireless car chargers, OBD2 diagnostic scanners, and Bluetooth FM transmitters.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    iconName: "Smartphone",
    subcategories: [
      { id: "dash-cameras", name: "Dash Cameras", slug: "dash-cameras" },
      { id: "chargers", name: "Car Chargers", slug: "chargers" }
    ]
  },
  {
    id: "tools-emergency",
    name: "Tools & Emergency Kits",
    slug: "tools-emergency",
    description: "Heavy-duty jump starters, portable air compressors, battery chargers, and high-pressure washers.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800",
    iconName: "Hammer",
    subcategories: [
      { id: "jump-starters", name: "Jump Starters & Chargers", slug: "jump-starters" },
      { id: "pressure-washers", name: "Pressure Washers & Vacuums", slug: "pressure-washers" },
      { id: "wiper-blades", name: "Wiper Blades", slug: "wiper-blades" }
    ]
  }
];
