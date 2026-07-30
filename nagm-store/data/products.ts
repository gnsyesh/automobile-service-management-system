import { Product } from "@/types";

export const products: Product[] = [
  // ==================== ENGINE OILS ====================
  {
    id: "prod-001",
    sku: "NS-OIL-001",
    name: "Mobil 1 ESP 5W-30 Fully Synthetic Engine Oil - 4L",
    brand: "Mobil 1",
    category: "engine-oils",
    subcategory: "fully-synthetic",
    price: 1850,
    oldPrice: 2150,
    discount: 14,
    rating: 4.9,
    reviewsCount: 142,
    inStock: true,
    stockCount: 45,
    isFeatured: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1615900119311-654877f0a9ef?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Advanced full synthetic engine oil providing exceptional cleaning power, wear protection, and overall performance.",
    description: "Mobil 1 ESP 5W-30 is an advanced performance synthetic engine oil designed to help provide exceptional cleaning power, wear protection, and overall performance. Mobil 1 ESP 5W-30 has been expertly engineered to help prolong the life and maintain the efficiency of emission systems in both diesel and gasoline powered automobiles.",
    specifications: [
      { label: "Viscosity", value: "5W-30" },
      { label: "Volume", value: "4 Liters" },
      { label: "Oil Type", value: "100% Fully Synthetic" },
      { label: "API Standards", value: "API SP / SN Plus" },
      { label: "ACEA Standards", value: "ACEA C2 / C3" },
      { label: "OEM Approvals", value: "MB-Approval 229.52 / 229.51, VW 504 00 / 507 00, BMW Longlife-04" },
      { label: "Country of Origin", value: "France / EU" }
    ],
    features: [
      "Helps reduce particulate build-up in diesel particulate filters",
      "Helps reduce poisoning of gasoline catalytic converters",
      "Reduces deposits and sludge build-up to enable long and clean engine life",
      "Quick cold-weather starting and fast protection to help extend engine life"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2026, engine: "1.6L Dual VVT-i" },
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2026, engine: "1.6L MPI" },
      { make: "Kia", model: "Cerato / Grand Cerato", yearStart: 2016, yearEnd: 2025, engine: "1.6L Gamma MPI" },
      { make: "Nissan", model: "Qashqai J11 / J12", yearStart: 2014, yearEnd: 2025, engine: "1.2L DIG-T" },
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026, engine: "320i 2.0L B48 Turbo" }
    ],
    weight: "3.75 kg",
    packageSize: "28cm x 18cm x 12cm",
    relatedProductIds: ["prod-002", "prod-003", "prod-015"],
    frequentlyBoughtTogetherIds: ["prod-015", "prod-016"]
  },
  {
    id: "prod-002",
    sku: "NS-OIL-002",
    name: "Shell Helix Ultra ECT C3 5W-30 Synthetic Motor Oil - 4L",
    brand: "Shell",
    category: "engine-oils",
    subcategory: "fully-synthetic",
    price: 1720,
    oldPrice: 1980,
    discount: 13,
    rating: 4.8,
    reviewsCount: 98,
    inStock: true,
    stockCount: 30,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Formulated with Shell PurePlus technology created from natural gas for ultimate engine cleanliness.",
    description: "Shell Helix Ultra ECT C3 5W-30 features its emissions compatible technology that helps to keep diesel particulate filters clean and maintain engine performance.",
    specifications: [
      { label: "Viscosity", value: "5W-30" },
      { label: "Volume", value: "4 Liters" },
      { label: "Oil Type", value: "Fully Synthetic PurePlus" },
      { label: "API Standards", value: "API SN" },
      { label: "ACEA Standards", value: "ACEA C3" }
    ],
    features: [
      "Unsurpassed sludge protection",
      "Low viscosity and low friction characteristics for up to 1.7% greater fuel economy",
      "Protects emissions systems by helping to keep DPF clean"
    ],
    compatibility: [
      { make: "Mercedes-Benz", model: "C-Class (W205 / W206)", yearStart: 2015, yearEnd: 2026, engine: "C180 1.5L Turbo" },
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026, engine: "320i 2.0L B48 Turbo" },
      { make: "Skoda", model: "Octavia (A7 / A8)", yearStart: 2014, yearEnd: 2026, engine: "1.4L TSI Turbo" }
    ],
    weight: "3.7 kg",
    relatedProductIds: ["prod-001", "prod-017"],
    frequentlyBoughtTogetherIds: ["prod-017", "prod-018"]
  },
  {
    id: "prod-003",
    sku: "NS-OIL-003",
    name: "Castrol EDGE 5W-40 Advanced Full Synthetic Engine Oil - 4L",
    brand: "Castrol",
    category: "engine-oils",
    subcategory: "fully-synthetic",
    price: 1790,
    oldPrice: 2050,
    discount: 12,
    rating: 4.9,
    reviewsCount: 115,
    inStock: true,
    stockCount: 50,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1615900119311-654877f0a9ef?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Engineered with Fluid TITANIUM Technology that transforms under pressure to keep metal apart.",
    description: "Castrol EDGE 5W-40 with Fluid TITANIUM is the natural choice for drivers who demand maximum engine performance from today's modern vehicles requiring a high level of protection and higher performance oils.",
    specifications: [
      { label: "Viscosity", value: "5W-40" },
      { label: "Volume", value: "4 Liters" },
      { label: "Oil Type", value: "Fully Synthetic Fluid TITANIUM" },
      { label: "API Standards", value: "API SP / CF" },
      { label: "ACEA Standards", value: "ACEA A3/B4" }
    ],
    features: [
      "Transforms to be strongest when the pressure is highest, protecting your engine",
      "Reduces power-robbing friction across engine speeds and conditions",
      "Independently tested at highest standards for proven performance"
    ],
    compatibility: [
      { make: "Volkswagen", model: "Golf / Passat", yearStart: 2012, yearEnd: 2024 },
      { make: "Fiat", model: "Tipo", yearStart: 2016, yearEnd: 2025, engine: "1.6L E-Torq Auto" },
      { make: "Hyundai", model: "Tucson", yearStart: 2015, yearEnd: 2026 }
    ],
    weight: "3.8 kg",
    relatedProductIds: ["prod-001", "prod-004"],
    frequentlyBoughtTogetherIds: ["prod-015", "prod-023"]
  },
  {
    id: "prod-004",
    sku: "NS-OIL-004",
    name: "TotalEnergies Quartz 9000 Energy 5W-40 - 4L",
    brand: "TotalEnergies",
    category: "engine-oils",
    subcategory: "fully-synthetic",
    price: 1550,
    oldPrice: 1780,
    discount: 13,
    rating: 4.7,
    reviewsCount: 76,
    inStock: true,
    stockCount: 25,
    images: [
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Synthetic technology motor oil for Peugeot, Citroen, Renault and European cars.",
    description: "TotalEnergies Quartz 9000 Energy 5W-40 has been developed to cover the most stringent requirements of both gasoline and diesel passenger car engines.",
    specifications: [
      { label: "Viscosity", value: "5W-40" },
      { label: "Volume", value: "4 Liters" },
      { label: "API Standards", value: "API SN / CF" }
    ],
    features: [
      "Anti-wear protection ensures optimal engine longevity",
      "Extremely high thermal stability and oxidation resistance"
    ],
    compatibility: [
      { make: "Peugeot", model: "301 / 508", yearStart: 2013, yearEnd: 2025 }
    ],
    weight: "3.75 kg"
  },
  {
    id: "prod-005",
    sku: "NS-OIL-005",
    name: "Petromin Super Synthetic 10W-40 Motor Oil - 4L",
    brand: "Petromin",
    category: "engine-oils",
    subcategory: "semi-synthetic",
    price: 980,
    oldPrice: 1150,
    discount: 15,
    rating: 4.6,
    reviewsCount: 64,
    inStock: true,
    stockCount: 60,
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Heavy-duty semi-synthetic engine oil specifically formulated for hot Middle Eastern weather conditions.",
    description: "Petromin Super Synthetic 10W-40 is a high quality multi-grade engine oil designed to protect against thermal breakdown and deposit formation under high ambient temperature operation in Egypt.",
    specifications: [
      { label: "Viscosity", value: "10W-40" },
      { label: "Volume", value: "4 Liters" },
      { label: "Oil Type", value: "Semi-Synthetic" },
      { label: "API Standards", value: "API SN / CF" }
    ],
    features: [
      "Formulated for extreme heat resistance",
      "Protects engines with high mileage from oil consumption",
      "Excellent sludge control for daily city commuting"
    ],
    compatibility: [
      { make: "Nissan", model: "Sunny N17", yearStart: 2010, yearEnd: 2026, engine: "1.5L HR15DE" },
      { make: "Hyundai", model: "Accent HC / RB", yearStart: 2011, yearEnd: 2024, engine: "1.6L Gamma" },
      { make: "Toyota", model: "Yaris", yearStart: 2012, yearEnd: 2024, engine: "1.3L VVT-i" }
    ],
    weight: "3.7 kg"
  },
  {
    id: "prod-006",
    sku: "NS-OIL-006",
    name: "Liqui Moly Leichtlauf High Tech 5W-40 Synthetic Oil - 5L",
    brand: "Liqui Moly",
    category: "engine-oils",
    subcategory: "fully-synthetic",
    price: 2650,
    oldPrice: 2950,
    discount: 10,
    rating: 5.0,
    reviewsCount: 89,
    inStock: true,
    stockCount: 20,
    isOffer: true,
    images: [
      "https://images.unsplash.com/photo-1600706432520-22d73f91ef8d?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Premium German 100% synthetic low-friction motor oil for year-round use in modern gasoline & diesel engines.",
    description: "Top-class, modern, low-friction engine oil for all-season use in gasoline and diesel engines with and without multi-valve technology, turbocharging and charge air cooling. Crafted in Germany.",
    specifications: [
      { label: "Viscosity", value: "5W-40" },
      { label: "Volume", value: "5 Liters" },
      { label: "Made In", value: "Germany" },
      { label: "API Standards", value: "API SP / SN" },
      { label: "OEM Approvals", value: "BMW Longlife-01, MB-Approval 229.5, Porsche A40, VW 502 00/505 00" }
    ],
    features: [
      "Smooth engine running and instant lubrication after cold start",
      "Outstanding engine cleanliness and extreme shear stability",
      "Saves fuel and reduces pollutant emissions"
    ],
    compatibility: [
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026 },
      { make: "Mercedes-Benz", model: "C-Class (W205 / W206)", yearStart: 2015, yearEnd: 2026 },
      { make: "Skoda", model: "Octavia (A7 / A8)", yearStart: 2014, yearEnd: 2026 }
    ],
    weight: "4.7 kg"
  },

  // ==================== TRANSMISSION & GEAR OILS ====================
  {
    id: "prod-007",
    sku: "NS-TRN-001",
    name: "Mobil ATF 3309 Automatic Transmission Fluid - 1L",
    brand: "Mobil 1",
    category: "transmission-fluids",
    subcategory: "atf",
    price: 490,
    oldPrice: 550,
    discount: 11,
    rating: 4.8,
    reviewsCount: 42,
    inStock: true,
    stockCount: 40,
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Exceptionally high performance lubricant that meets original equipment manufacturers' specifications for use in certain slip-controlled automatic transmissions.",
    description: "Mobil ATF 3309 is recommended for use in transmissions requiring fluids meeting JWS 3309 or GM 9986195 quality levels. It is also recommended for service fill applications where Toyota T-IV or T-4 is specified.",
    specifications: [
      { label: "Fluid Type", value: "Automatic Transmission Fluid (ATF)" },
      { label: "Volume", value: "1 Liter" },
      { label: "Standards", value: "JWS 3309, Toyota T-IV, Audi G-055-025-A2" }
    ],
    features: [
      "Excellent lubricating characteristics for quiet operation and smooth shifting",
      "Controlled friction properties for smooth and efficient transmission of power",
      "Helps to extend transmission life based on excellent wear control"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2018 },
      { make: "Nissan", model: "Sunny N17", yearStart: 2010, yearEnd: 2020 }
    ],
    weight: "0.95 kg"
  },
  {
    id: "prod-008",
    sku: "NS-TRN-002",
    name: "Liqui Moly Top Tec ATF 1800 Low Viscosity - 1L",
    brand: "Liqui Moly",
    category: "transmission-fluids",
    subcategory: "atf",
    price: 780,
    oldPrice: 890,
    discount: 12,
    rating: 4.9,
    reviewsCount: 35,
    inStock: true,
    stockCount: 25,
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "High-performance low-viscosity synthetic automatic transmission oil developed for modern 6, 8, and 9-speed automatic transmissions.",
    description: "Liqui Moly Top Tec ATF 1800 is a modern high-performance ATF based on synthetic technology. It provides maximum thermal stability and wear protection even in harsh driving conditions.",
    specifications: [
      { label: "Volume", value: "1 Liter" },
      { label: "Standards", value: "Dexron VI, Mercon LV, BMW 83 22 2 152 426, ZF TE-ML 11" }
    ],
    features: [
      "Prevents foam formation and enables extremely smooth gear shifts",
      "Extremely good low temperature properties"
    ],
    compatibility: [
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026 },
      { make: "BMW", model: "5 Series (G30)", yearStart: 2017, yearEnd: 2024 }
    ],
    weight: "0.96 kg"
  },

  // ==================== BRAKE SYSTEM ====================
  {
    id: "prod-009",
    sku: "NS-BRK-001",
    name: "Brembo Prime Ceramic Front Brake Pads - Set for Toyota Corolla",
    brand: "Brembo",
    category: "brake-system",
    subcategory: "brake-pads",
    price: 1650,
    oldPrice: 1890,
    discount: 13,
    rating: 4.9,
    reviewsCount: 88,
    inStock: true,
    stockCount: 35,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1600706432520-22d73f91ef8d?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Low-dust, noise-free premium ceramic brake pads designed for superior stopping power.",
    description: "Brembo Ceramic brake pads are engineered to minimize braking distance while offering maximum braking comfort, low dust emission, and quiet performance.",
    specifications: [
      { label: "Material", value: "Advanced Ceramic Compound" },
      { label: "Position", value: "Front Axle" },
      { label: "Features", value: "Includes Anti-Squeal Shims & Wear Indicators" },
      { label: "Certification", value: "ECE R90 Certified" }
    ],
    features: [
      "Up to 80% less brake dust compared to standard semi-metallic pads",
      "Reduces brake noise and vibrations completely",
      "Thermal scorched surface for immediate bedding-in period"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2026, engine: "1.6L Dual VVT-i" }
    ],
    weight: "1.85 kg",
    relatedProductIds: ["prod-011", "prod-013"],
    frequentlyBoughtTogetherIds: ["prod-011", "prod-013"]
  },
  {
    id: "prod-010",
    sku: "NS-BRK-002",
    name: "Bosch Low Metallic Front Brake Pads for Hyundai Elantra / Kia Cerato",
    brand: "Bosch",
    category: "brake-system",
    subcategory: "brake-pads",
    price: 1180,
    oldPrice: 1350,
    discount: 13,
    rating: 4.7,
    reviewsCount: 110,
    inStock: true,
    stockCount: 50,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1600706432520-22d73f91ef8d?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Bosch QuietCast metallic technology delivers high stopping performance and long service life.",
    description: "Bosch QuietCast Brake Pads offer premium performance that vehicle owners can rely on. Engineered with Molded Shim Technology (MST) to ensure maximum stability and silent stopping.",
    specifications: [
      { label: "Material", value: "Semi-Metallic Low-Dust" },
      { label: "Position", value: "Front Axle" },
      { label: "Country of Origin", value: "Germany / EU" }
    ],
    features: [
      "OE style multi-layer shim for superior noise dampening",
      "Powder-coated backing plate prevents rust and corrosion"
    ],
    compatibility: [
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2026, engine: "1.6L MPI" },
      { make: "Kia", model: "Cerato / Grand Cerato", yearStart: 2016, yearEnd: 2025, engine: "1.6L Gamma MPI" }
    ],
    weight: "1.9 kg"
  },
  {
    id: "prod-011",
    sku: "NS-BRK-003",
    name: "Brembo UV Coated Vented Front Brake Discs Pair (2 pcs)",
    brand: "Brembo",
    category: "brake-system",
    subcategory: "brake-discs",
    price: 2950,
    oldPrice: 3400,
    discount: 13,
    rating: 4.9,
    reviewsCount: 47,
    inStock: true,
    stockCount: 18,
    images: [
      "https://images.unsplash.com/photo-1600706432520-22d73f91ef8d?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "High-carbon UV coated ventilated brake rotors providing superior corrosion protection and thermal dissipation.",
    description: "Brembo UV Coated brake rotors offer an environmentally friendly solvent-free UV coating technology that offers superior protection to the disc, including the braking surfaces, hub, and outer edge.",
    specifications: [
      { label: "Disc Type", value: "Ventilated High-Carbon" },
      { label: "Diameter", value: "275 mm" },
      { label: "Quantity", value: "Pair (2 Discs)" }
    ],
    features: [
      "UV paint coating protects against corrosion and keeps hub looking shiny",
      "High carbon content minimizes vibration and brake judder"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2026 }
    ],
    weight: "12.4 kg"
  },
  {
    id: "prod-012",
    sku: "NS-BRK-004",
    name: "Bosch Super High Performance DOT 4 Brake Fluid - 1L",
    brand: "Bosch",
    category: "brake-system",
    subcategory: "brake-fluids",
    price: 320,
    oldPrice: 380,
    discount: 16,
    rating: 4.8,
    reviewsCount: 82,
    inStock: true,
    stockCount: 65,
    images: [
      "https://images.unsplash.com/photo-1600706432520-22d73f91ef8d?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "High boiling point DOT 4 synthetic hydraulic brake fluid for ABS and ESP braking systems.",
    description: "Bosch DOT 4 brake fluid is formulated for modern disc and drum brake systems as well as hydraulic clutch systems. It features a wet boiling point exceeding safety requirements.",
    specifications: [
      { label: "Standard", value: "DOT 4" },
      { label: "Dry Boiling Point", value: "265°C" },
      { label: "Volume", value: "1 Liter" }
    ],
    features: [
      "High thermal stability prevents vapor lock under aggressive braking",
      "Protects internal rubber seals and prevents system corrosion"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2026 },
      { make: "Nissan", model: "Sunny N17", yearStart: 2010, yearEnd: 2026 },
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2012, yearEnd: 2026 }
    ],
    weight: "1.1 kg"
  },

  // ==================== FILTERS ====================
  {
    id: "prod-015",
    sku: "NS-FLT-001",
    name: "Mann-Filter W 68/3 Spin-On Engine Oil Filter",
    brand: "Mann Filter",
    category: "filters",
    subcategory: "oil-filters",
    price: 380,
    oldPrice: 450,
    discount: 15,
    rating: 4.9,
    reviewsCount: 156,
    inStock: true,
    stockCount: 90,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "100% German OE quality oil filter with anti-drain back membrane and bypass valve.",
    description: "Mann-Filter oil filters remove harmful dirt particles and carbon deposits from engine oil to safeguard internal engine components.",
    specifications: [
      { label: "Filter Type", value: "Spin-on Oil Filter" },
      { label: "Made In", value: "Germany" },
      { label: "OEM Part Number", value: "90915-YZZE1 / 90915-YZZJ1" }
    ],
    features: [
      "Heavy duty housing prevents pressure leaks under cold starts",
      "Silicone anti-drainback valve retains oil in filter when engine is off"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2026 },
      { make: "Toyota", model: "Yaris", yearStart: 2012, yearEnd: 2024 }
    ],
    weight: "0.32 kg"
  },
  {
    id: "prod-016",
    sku: "NS-FLT-002",
    name: "Mann-Filter C 24 005 High-Flow Air Filter",
    brand: "Mann Filter",
    category: "filters",
    subcategory: "air-filters",
    price: 490,
    oldPrice: 580,
    discount: 16,
    rating: 4.8,
    reviewsCount: 78,
    inStock: true,
    stockCount: 40,
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "OE engine air filter media designed to capture 99.5% of dust particles.",
    description: "Mann-Filter air filters prevent airborne dust, pollen, and debris from entering the combustion chamber.",
    specifications: [
      { label: "Filter Material", value: "Pleated Micro-cellulose Paper" },
      { label: "Fitment", value: "Direct OEM Replacement" }
    ],
    features: [
      "Ensures optimal air-fuel ratio for maximum fuel economy",
      "Resistant to high humidity and temperature changes"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2026 }
    ],
    weight: "0.45 kg"
  },
  {
    id: "prod-017",
    sku: "NS-FLT-003",
    name: "Bosch Activated Carbon Cabin Filter for Hyundai & Kia",
    brand: "Bosch",
    category: "filters",
    subcategory: "cabin-filters",
    price: 420,
    oldPrice: 500,
    discount: 16,
    rating: 4.7,
    reviewsCount: 92,
    inStock: true,
    stockCount: 55,
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Activated charcoal cabin air filter absorbs harmful exhaust gases, odors, micro-particles, and allergens.",
    description: "Bosch Aeristo Premium cabin filters feature coconut shell charcoal layers that purify air entering the vehicle cabin through heating and A/C vents.",
    specifications: [
      { label: "Layer Type", value: "Multi-layer Charcoal Activated" },
      { label: "Protection", value: "Dust, Pollen, Bacteria, Odors" }
    ],
    features: [
      "Filters out fine PM2.5 dust particles",
      "Eliminates unpleasant external odors and exhaust fumes"
    ],
    compatibility: [
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2026 },
      { make: "Kia", model: "Cerato / Grand Cerato", yearStart: 2016, yearEnd: 2025 }
    ],
    weight: "0.28 kg"
  },

  // ==================== IGNITION & BATTERIES ====================
  {
    id: "prod-020",
    sku: "NS-IGN-001",
    name: "NGK Laser Iridium Spark Plug Set (4 pcs) - SILZKR7B11",
    brand: "NGK",
    category: "ignition-electrical",
    subcategory: "spark-plugs",
    price: 1250,
    oldPrice: 1450,
    discount: 14,
    rating: 4.9,
    reviewsCount: 134,
    inStock: true,
    stockCount: 45,
    isFeatured: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Laser welded Iridium tip spark plugs engineered for superior ignitability and 100,000 km lifespan.",
    description: "NGK Laser Iridium spark plugs provide superior ignitability and long service life. Smallest tip diameter available Iridium surfaces ensure slow wear rate providing stable idle, superior anti fouling, improved fuel efficiency and lower emissions.",
    specifications: [
      { label: "Center Electrode", value: "Fine Wire Iridium Tip" },
      { label: "Ground Electrode", value: "Platinum Chip" },
      { label: "Lifespan", value: "Up to 100,000 km" },
      { label: "Quantity", value: "Pack of 4 Plugs" }
    ],
    features: [
      "Trivalent metal plating provides superior anti-corrosion and anti-seizing properties",
      "Faster starts and quicker acceleration",
      "Best fuel economy and lowest tailpipe emissions"
    ],
    compatibility: [
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2026, engine: "1.6L MPI" },
      { make: "Kia", model: "Cerato / Grand Cerato", yearStart: 2016, yearEnd: 2025, engine: "1.6L Gamma MPI" }
    ],
    weight: "0.25 kg",
    relatedProductIds: ["prod-021", "prod-022"],
    frequentlyBoughtTogetherIds: ["prod-022", "prod-001"]
  },
  {
    id: "prod-021",
    sku: "NS-IGN-002",
    name: "Denso Iridium Power Spark Plugs Set (4 pcs) - IK20TT",
    brand: "Denso",
    category: "ignition-electrical",
    subcategory: "spark-plugs",
    price: 1150,
    oldPrice: 1350,
    discount: 15,
    rating: 4.8,
    reviewsCount: 88,
    inStock: true,
    stockCount: 30,
    images: [
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "0.4mm ultra-fine Iridium center electrode designed to maximize spark energy.",
    description: "Denso Iridium Power plugs feature a patented 0.4mm Iridium alloy electrode that produces a much hotter spark with lower voltage requirements.",
    specifications: [
      { label: "Electrode Diameter", value: "0.4mm Iridium" },
      { label: "Quantity", value: "Pack of 4 Plugs" }
    ],
    features: [
      "Dramatic increase in throttle response",
      "High resistance to carbon fouling"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2020 },
      { make: "Nissan", model: "Sunny N17", yearStart: 2010, yearEnd: 2026 }
    ],
    weight: "0.24 kg"
  },
  {
    id: "prod-023",
    sku: "NS-BAT-001",
    name: "Varta Silver Dynamic AGM Car Battery 70Ah 760A",
    brand: "Varta",
    category: "ignition-electrical",
    subcategory: "batteries",
    price: 4850,
    oldPrice: 5500,
    discount: 12,
    rating: 4.9,
    reviewsCount: 65,
    inStock: true,
    stockCount: 15,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Heavy duty German Absorbent Glass Mat (AGM) battery engineered for advanced Start-Stop vehicles.",
    description: "Varta Silver Dynamic AGM batteries deliver unmatched cranking power and triple the cycle life of conventional lead-acid batteries. Ideal for premium European vehicles with high electrical loads.",
    specifications: [
      { label: "Capacity", value: "70 Ah" },
      { label: "Cold Cranking Amps (CCA)", value: "760 A" },
      { label: "Technology", value: "AGM (Absorbent Glass Mat)" },
      { label: "Voltage", value: "12 V" },
      { label: "Warranty in Egypt", value: "18 Months Replacement" }
    ],
    features: [
      "3x cycle life compared to standard flooded batteries",
      "PowerFrame grid technology for maximum cold start performance",
      "Leak-proof, vibration resistant, and 100% maintenance-free"
    ],
    compatibility: [
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026 },
      { make: "Mercedes-Benz", model: "C-Class (W205 / W206)", yearStart: 2015, yearEnd: 2026 },
      { make: "Skoda", model: "Octavia (A7 / A8)", yearStart: 2014, yearEnd: 2026 }
    ],
    weight: "19.5 kg"
  },

  // ==================== ADDITIVES ====================
  {
    id: "prod-026",
    sku: "NS-ADD-001",
    name: "Liqui Moly Cera Tec Friction Reducer Treatment - 300ml",
    brand: "Liqui Moly",
    category: "additives",
    subcategory: "engine-additives",
    price: 890,
    oldPrice: 1050,
    discount: 15,
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    stockCount: 40,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "High-tech ceramic anti-friction engine oil additive offering extreme wear protection for up to 50,000 km.",
    description: "Cera Tec is a high-tech ceramic wear protection product for all motor oils. Cera Tec reduces friction and wear thanks to ceramic compounds that offer high chemical and thermal stability.",
    specifications: [
      { label: "Volume", value: "300 ml" },
      { label: "Dosage", value: "1 can treats up to 5 Liters of oil" },
      { label: "Protection Duration", value: "50,000 km" }
    ],
    features: [
      "Reduces engine noise and operating vibration",
      "Decreases fuel consumption and engine wear dramatically",
      "Suitable for gasoline and diesel engines"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2026 },
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2012, yearEnd: 2026 },
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026 }
    ],
    weight: "0.35 kg"
  },
  {
    id: "prod-027",
    sku: "NS-ADD-002",
    name: "Liqui Moly Injector Cleaner Fuel Additive - 300ml",
    brand: "Liqui Moly",
    category: "additives",
    subcategory: "fuel-additives",
    price: 460,
    oldPrice: 540,
    discount: 15,
    rating: 4.8,
    reviewsCount: 95,
    inStock: true,
    stockCount: 60,
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Cleans dirty petrol fuel injection systems, removes carbon deposits on valves, spark plugs, and intake manifold.",
    description: "Liqui Moly Injector Cleaner restores optimal engine performance by removing carbon crusts and varnish build-up inside injectors.",
    specifications: [
      { label: "Volume", value: "300 ml" },
      { label: "Treatment", value: "Add directly into fuel tank prior to refueling" }
    ],
    features: [
      "Ensures precise fuel metering and atomization",
      "Restores lost engine power and reduces hesitations"
    ],
    weight: "0.32 kg"
  },

  // ==================== COOLANTS & RADIATORS ====================
  {
    id: "prod-030",
    sku: "NS-CLT-001",
    name: "TotalEnergies Coolelf Auto Supra -37°C Red Coolant - 5L",
    brand: "TotalEnergies",
    category: "coolants-fluids",
    subcategory: "coolants",
    price: 1150,
    oldPrice: 1320,
    discount: 13,
    rating: 4.8,
    reviewsCount: 54,
    inStock: true,
    stockCount: 30,
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Long-life Organic Acid Technology (OAT) pre-mixed pink/red radiator coolant for maximum heat transfer.",
    description: "TotalEnergies Coolelf Auto Supra is a top-tier pre-mixed coolant designed to protect engine block metals including aluminum against overheating, freezing, and cavitation.",
    specifications: [
      { label: "Color", value: "Red / Pink" },
      { label: "Concentration", value: "Ready to use (-37°C)" },
      { label: "Volume", value: "5 Liters" },
      { label: "Technology", value: "OAT Organic Acid Technology" }
    ],
    features: [
      "Prevents radiator scale deposits and rust formation",
      "Protects cooling system up to 250,000 km or 5 years"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2026 },
      { make: "Nissan", model: "Sunny N17", yearStart: 2010, yearEnd: 2026 }
    ],
    weight: "5.4 kg"
  },

  // ==================== SUSPENSION & SHOCK ABSORBERS ====================
  {
    id: "prod-035",
    sku: "NS-SUS-001",
    name: "Monroe OESpectrum Front Shock Absorbers Pair for Toyota Corolla",
    brand: "Monroe",
    category: "suspension-steering",
    subcategory: "shock-absorbers",
    price: 3600,
    oldPrice: 4200,
    discount: 14,
    rating: 4.9,
    reviewsCount: 38,
    inStock: true,
    stockCount: 12,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Twin-technology nitrogen gas charged shocks for ultimate ride comfort and road control.",
    description: "Monroe OESpectrum shock absorbers feature precision-tuned valving to provide maximum wheel control and exceptional feedback on Egyptian roads.",
    specifications: [
      { label: "Type", value: "Nitrogen Gas Charged Twin Tube" },
      { label: "Position", value: "Front Axle Pair (Left & Right)" },
      { label: "Warranty", value: "1 Year" }
    ],
    features: [
      "R-TECH2 rebound valving provides faster reaction time to road bumps",
      "Fluon banded piston for consistent sealing and durability"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2024 }
    ],
    weight: "8.5 kg"
  },
  {
    id: "prod-036",
    sku: "NS-SUS-002",
    name: "KYB Excel-G Gas Shock Absorber Rear Pair for Hyundai Elantra",
    brand: "KYB",
    category: "suspension-steering",
    subcategory: "shock-absorbers",
    price: 3200,
    oldPrice: 3700,
    discount: 13,
    rating: 4.8,
    reviewsCount: 45,
    inStock: true,
    stockCount: 16,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Japanese OEM specification twin-tube shock absorbers that restore original vehicle handling capabilities.",
    description: "KYB Excel-G is calibrated to help restore original vehicle performance characteristics, keeping handling precise and cornering stable.",
    specifications: [
      { label: "Position", value: "Rear Axle Pair" },
      { label: "Made In", value: "Japan" }
    ],
    features: [
      "Seamless working cylinder with Teflon coated piston band for positive seal",
      "Triple chrome-plated piston rod and multi-lip oil seals"
    ],
    compatibility: [
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2025 }
    ],
    weight: "7.2 kg"
  },

  // ==================== TYRES ====================
  {
    id: "prod-040",
    sku: "NS-TYR-001",
    name: "Michelin Primacy 4+ 205/55 R16 91V Car Tyre",
    brand: "Michelin",
    category: "tyres-wheels",
    subcategory: "tyres",
    price: 4250,
    oldPrice: 4800,
    discount: 11,
    rating: 4.9,
    reviewsCount: 72,
    inStock: true,
    stockCount: 24,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Long-lasting safety and ultimate wet braking performance engineered by Michelin.",
    description: "Michelin Primacy 4+ features EverGrip technology with self-regenerating tread compound that provides excellent wet braking from the first to the last kilometer.",
    specifications: [
      { label: "Size", value: "205/55 R16" },
      { label: "Speed Rating", value: "V (up to 240 km/h)" },
      { label: "Load Index", value: "91 (615 kg per tyre)" },
      { label: "Season", value: "Summer / All-Season" },
      { label: "Country of Manufacture", value: "Germany / Europe" }
    ],
    features: [
      "MaxTouch construction maximizes contact with the road for even tread wear",
      "Outstanding wet braking performance even when worn"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2026 },
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2026 },
      { make: "Kia", model: "Cerato / Grand Cerato", yearStart: 2016, yearEnd: 2025 },
      { make: "Fiat", model: "Tipo", yearStart: 2016, yearEnd: 2025 }
    ],
    weight: "8.2 kg"
  },
  {
    id: "prod-041",
    sku: "NS-TYR-002",
    name: "Bridgestone Turanza T005 225/45 R17 94W Tyre",
    brand: "Bridgestone",
    category: "tyres-wheels",
    subcategory: "tyres",
    price: 5400,
    oldPrice: 6100,
    discount: 11,
    rating: 4.8,
    reviewsCount: 51,
    inStock: true,
    stockCount: 20,
    images: [
      "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Premium touring tyre offering best-in-class wet control and highway smoothness.",
    description: "Bridgestone Turanza T005 enables drivers to feel confident in challenging wet and dry conditions alike.",
    specifications: [
      { label: "Size", value: "225/45 R17" },
      { label: "Speed Rating", value: "W (up to 270 km/h)" }
    ],
    features: [
      "Optimized 3D siping patterns for wet grip",
      "Reinforced sidewalls for cornering stability"
    ],
    compatibility: [
      { make: "BMW", model: "3 Series (F30 / G20)", yearStart: 2012, yearEnd: 2026 },
      { make: "Mercedes-Benz", model: "C-Class (W205 / W206)", yearStart: 2015, yearEnd: 2026 },
      { make: "Skoda", model: "Octavia (A7 / A8)", yearStart: 2014, yearEnd: 2026 }
    ],
    weight: "9.6 kg"
  },

  // ==================== LIGHTING & LED ====================
  {
    id: "prod-045",
    sku: "NS-LGT-001",
    name: "Bosch Ultra White H7 LED Headlight Bulb Conversion Kit - 6000K",
    brand: "Bosch",
    category: "lighting",
    subcategory: "led-headlights",
    price: 1890,
    oldPrice: 2200,
    discount: 14,
    rating: 4.9,
    reviewsCount: 112,
    inStock: true,
    stockCount: 35,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Ultra-bright 6000K crisp white LED bulb conversion kit with integrated active cooling fan.",
    description: "Bosch Ultra White LED bulbs produce up to +250% brighter light output compared to standard halogen bulbs, cutting through night darkness and highway glare.",
    specifications: [
      { label: "Socket Type", value: "H7 / H11" },
      { label: "Color Temperature", value: "6000K Cool White" },
      { label: "Luminous Flux", value: "12,000 Lumens Pair" },
      { label: "Lifespan", value: "50,000 Hours" }
    ],
    features: [
      "Canbus Error Free decoder prevents dashboard warning light",
      "Aviation grade aluminum heatsink with 12,000 RPM turbofan"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2026 },
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2012, yearEnd: 2026 },
      { make: "Kia", model: "Cerato / Grand Cerato", yearStart: 2012, yearEnd: 2025 }
    ],
    weight: "0.42 kg"
  },

  // ==================== CAR CARE & DETAILING ====================
  {
    id: "prod-050",
    sku: "NS-CAR-001",
    name: "Liqui Moly Gloss Car Shampoo & Wax - 1L",
    brand: "Liqui Moly",
    category: "car-care",
    subcategory: "car-shampoo",
    price: 490,
    oldPrice: 580,
    discount: 15,
    rating: 4.8,
    reviewsCount: 88,
    inStock: true,
    stockCount: 50,
    images: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Concentrated car washing shampoo with genuine Carnauba wax for high gloss shine.",
    description: "Liqui Moly Gloss Shampoo cleans and protects in one easy step. Removes road dirt, bug splatters, and brake dust while leaving a protective hydrophobic wax layer.",
    specifications: [
      { label: "Volume", value: "1 Liter" },
      { label: "pH Level", value: "pH Neutral (Safe for Ceramic Coatings)" }
    ],
    features: [
      "High foaming formula lifts dirt without scratching paintwork",
      "Leaves deep wet-look hydrophobic shine"
    ],
    weight: "1.1 kg"
  },
  {
    id: "prod-051",
    sku: "NS-CAR-002",
    name: "Luxury Areon Leather Car Air Freshener Perfume - Gold",
    brand: "Liqui Moly",
    category: "car-care",
    subcategory: "car-perfumes",
    price: 240,
    oldPrice: 290,
    discount: 17,
    rating: 4.9,
    reviewsCount: 165,
    inStock: true,
    stockCount: 100,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Premium French scented car cologne diffusers for long-lasting luxury cabin ambiance.",
    description: "Areon Gold air perfume adds an exclusive luxury touch to your vehicle cabin with sophisticated woody and citrus top notes.",
    specifications: [
      { label: "Fragrance", value: "Gold Oud & Citrus" },
      { label: "Duration", value: "Up to 60 days" }
    ],
    features: [
      "Elegantly designed glass diffuser bottle",
      "Includes vent clip and hanging string"
    ],
    weight: "0.15 kg"
  },

  // ==================== ELECTRONICS & ACCESSORIES ====================
  {
    id: "prod-055",
    sku: "NS-ELC-001",
    name: "Ultra 4K Dual Lens Dash Camera with WiFi & Night Vision",
    brand: "Bosch",
    category: "electronics",
    subcategory: "dash-cameras",
    price: 3450,
    oldPrice: 3990,
    discount: 13,
    rating: 4.9,
    reviewsCount: 64,
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Front 4K Ultra HD and rear 1080P dual recording dash cam with G-Sensor parking monitor.",
    description: "Capture every detail on Egyptian roads with crisp 4K front resolution, Sony STARVIS night vision sensor, and mobile app WiFi connection for instant video download.",
    specifications: [
      { label: "Front Resolution", value: "4K 2160P @ 30fps" },
      { label: "Rear Resolution", value: "1080P Full HD" },
      { label: "Screen", value: "3.0 inch IPS Touch Screen" },
      { label: "Features", value: "G-Sensor, Loop Recording, 24h Parking Mode" }
    ],
    features: [
      "Sony STARVIS sensor for ultra-clear night recordings",
      "Built-in WiFi and mobile app for iOS and Android"
    ],
    weight: "0.65 kg"
  },
  {
    id: "prod-060",
    sku: "NS-INT-001",
    name: "5D Custom Leather Floor Mats Set for SUV / Sedan - Black & Gold Stitch",
    brand: "Bosch",
    category: "interior-accessories",
    subcategory: "floor-mats",
    price: 1950,
    oldPrice: 2350,
    discount: 17,
    rating: 4.8,
    reviewsCount: 78,
    inStock: true,
    stockCount: 30,
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Waterproof luxury 5-layer PU leather interior car floor liners with custom tailored lip coverage.",
    description: "Upgrade your cabin elegance while providing 100% protection against mud, sand, water, and dirt. Easy to remove and clean with hose.",
    specifications: [
      { label: "Material", value: "Heavy-duty PU Leather + EVA Foam" },
      { label: "Pieces", value: "5-Piece Full Set" }
    ],
    features: [
      "Non-slip bottom backing stays firmly in place",
      "Gold diamond stitching elevates luxury interior design"
    ],
    weight: "3.2 kg"
  },

  // ==================== TOOLS & WIPERS ====================
  {
    id: "prod-065",
    sku: "NS-TLS-001",
    name: "Valeo Silencio Flat Wiper Blade Set (Driver & Passenger)",
    brand: "Valeo",
    category: "tools-emergency",
    subcategory: "wiper-blades",
    price: 750,
    oldPrice: 880,
    discount: 15,
    rating: 4.8,
    reviewsCount: 92,
    inStock: true,
    stockCount: 40,
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "Premium frameless aerodynamic flat wiper blades with VisioRubber technology.",
    description: "Valeo Silencio Wiper blades ensure whisper-quiet wipe performance and streak-free visibility during rainstorms.",
    specifications: [
      { label: "Blade Type", value: "Flat Aerodynamic Beam" },
      { label: "Material", value: "Dual Synthetic VisioRubber" }
    ],
    features: [
      "Includes multi-clip adapters for quick snap installation",
      "Integrated spoiler prevents blade lift at highway speeds"
    ],
    compatibility: [
      { make: "Toyota", model: "Corolla", yearStart: 2014, yearEnd: 2026 },
      { make: "Hyundai", model: "Elantra CN7 / AD", yearStart: 2016, yearEnd: 2026 },
      { make: "Nissan", model: "Sunny N17", yearStart: 2010, yearEnd: 2026 }
    ],
    weight: "0.38 kg"
  },
  {
    id: "prod-070",
    sku: "NS-TLS-002",
    name: "Heavy-Duty 2000A Portable Lithium Jump Starter & Power Bank",
    brand: "ACDelco",
    category: "tools-emergency",
    subcategory: "jump-starters",
    price: 3250,
    oldPrice: 3800,
    discount: 14,
    rating: 4.9,
    reviewsCount: 54,
    inStock: true,
    stockCount: 20,
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800"
    ],
    shortDescription: "2000 Peak Amps battery jump starter capable of starting up to 8.0L Gas and 6.5L Diesel engines.",
    description: "Never get stranded with a dead battery again. Features smart jumper cables with spark-proof protection, built-in LED flashlight, and USB-C quick charge for smartphones.",
    specifications: [
      { label: "Peak Current", value: "2000 Amps" },
      { label: "Battery Capacity", value: "20,000 mAh" },
      { label: "Ports", value: "Dual USB QC3.0 + Type-C PD 18W" }
    ],
    features: [
      "Safely jump start a flat battery in 3 seconds",
      "Built-in 400-Lumen LED flashlight with Strobe and SOS modes"
    ],
    weight: "1.1 kg"
  }
];
