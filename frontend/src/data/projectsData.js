// JS RAM CONSTRUCTION — REAL PROJECTS & CATEGORY DATA
// Verified from the codebase. No invented data or stock imagery.

export const categoryData = [
  {
    id: "hospital",
    title: "Hospital",
    subtitle: "Healthcare & Institutional Infrastructure",
    description: "Specialised healthcare facilities engineered for advanced medical operations, heavy structural loads, and sterile environments.",
    coverImage: "/images/ram-swar-medspace.jpg",
    projectCount: 2,
    badge: "Healthcare",
  },
  {
    id: "commercial",
    title: "Commercial",
    subtitle: "Corporate Hubs & Retail Complexes",
    description: "Grade-A commercial spaces, multi-level basements, and retail complexes designed for commercial longevity and high footfall.",
    coverImage: "/images/whc-one.jpg",
    projectCount: 3,
    badge: "Commercial",
  },
  {
    id: "residential",
    title: "High-Rise Residential",
    subtitle: "Premium Towers & Gated Townships",
    description: "Multistorey luxury towers and master-planned residential communities built with precision engineering and structural excellence.",
    coverImage: "/images/palacio.jpg",
    projectCount: 5,
    badge: "Residential",
  },
];

export const categorizedProjects = {
  hospital: [
    {
      id: "ram-swar-medspace",
      name: "Ram Swar Medspace",
      categoryName: "Hospital Infrastructure",
      location: "Nagpur, Maharashtra",
      client: "Akshay Mehadia (Gopal Bricks)",
      configuration: "G+9 Hospital Building",
      floorPlate: "6,500 sq. ft.",
      additional: "Double basement · 8,000 sq. ft.",
      description:
        "Modern G+9 healthcare facility featuring double basements for critical services and parking. Engineered with high-strength structural specifications to support specialized diagnostic machinery and medical infrastructure.",
      image: "/images/ram-swar-medspace.jpg",
      progressImages: [
        "/images/ram-swar-progress-01.jpg",
        "/images/ram-swar-progress-02.jpg",
      ],
    },
    {
      id: "mayo-hospital",
      name: "Mayo Hospital Admin Building",
      categoryName: "Hospital Infrastructure",
      location: "Mount Road, Nagpur",
      client: "Sadiq and Company",
      configuration: "G+7 Hospital Administration Building",
      floorPlate: "44,000 sq. ft.",
      additional: "Large-format institutional facility",
      description:
        "Extensive 44,000 sq. ft. institutional administration facility for Mayo Hospital. Built with durable structural frames, open floor plates, and streamlined service integration for healthcare administrative management.",
      image: "/images/mayo-hospital.jpg",
      progressImages: [
        "/images/mayo-progress-01.jpg",
        "/images/mayo-progress-02.jpg",
      ],
    },
  ],

  commercial: [
    {
      id: "whc-one",
      name: "WHC One",
      categoryName: "Commercial Complex",
      location: "Coffee House Square, Nagpur",
      client: "Goleccha Housing Infra Pvt. Ltd.",
      configuration: "G+8 Commercial",
      floorPlate: "6,500 sq. ft.",
      additional: "Double basement · 10,000 sq. ft.",
      description:
        "Landmark G+8 commercial tower at Coffee House Square with 10,000 sq. ft. double basements for multi-level parking. Built with expansive column spacing for flexible retail and corporate floor plans.",
      image: "/images/whc-one.jpg",
      progressImages: ["/images/whc-one-progress.jpg"],
    },
    {
      id: "limbanna-towers",
      name: "Limbanna Towers",
      categoryName: "Commercial Complex",
      location: "Sadar, Nagpur",
      client: "Akshay Limbanna (Navratna Raghav)",
      configuration: "G+8 Commercial",
      floorPlate: "8,000 sq. ft.",
      additional: "Double basement · 11,000 sq. ft.",
      description:
        "High-density commercial development situated in Sadar, Nagpur. Features deep excavation with 11,000 sq. ft. double basement shoring and 8,000 sq. ft. floor plates designed for high-capacity corporate tenancies.",
      image: "/images/limbanna-towers.jpg",
      progressImages: [
        "/images/limbanna-progress-01.jpg",
        "/images/limbanna-progress-02.jpg",
        "/images/limbanna-progress-03.jpg",
      ],
    },
    {
      id: "vijaywargi-complex",
      name: "Vijaywargi Complex",
      categoryName: "Commercial Complex",
      location: "Bharat Nagar, Nagpur",
      client: "Vijaywargi Infra Engineers Pvt. Ltd.",
      configuration: "G+5 Commercial Complex",
      floorPlate: "5,500 sq. ft.",
      additional: "Prime commercial retail & corporate offices",
      description:
        "Contemporary G+5 commercial establishment combining ground-level retail frontages with upper-level corporate suites. Engineered for high foot-traffic durability and efficient structural loading.",
      image: "/images/vijaywargi-complex.jpg",
      progressImages: [
        "/images/vijaywargi-progress-01.jpg",
        "/images/vijaywargi-progress-02.jpg",
        "/images/vijaywargi-progress-03.jpg",
      ],
    },
  ],

  residential: [
    {
      id: "palacio",
      name: "Palacio",
      categoryName: "High-Rise Residential",
      location: "Shankar Nagar, Nagpur",
      client: "Raghav Lifespace",
      configuration: "G+15 Residential",
      floorPlate: "6,500 sq. ft.",
      additional: "Luxury high-rise residential apartments",
      description:
        "Prestigious G+15 luxury residential tower in Shankar Nagar. Features modern architectural silhouettes, precision-cast reinforced concrete framework, and panoramic views of the Nagpur skyline.",
      image: "/images/palacio.jpg",
      progressImages: [
        "/images/palacio-progress-01.jpg",
        "/images/palacio-progress-02.jpg",
      ],
    },
    {
      id: "royale-regency",
      name: "Royale Regency",
      categoryName: "High-Rise Residential",
      location: "Khare Town, Nagpur",
      client: "Vrindavan Constructions, Nagpur",
      configuration: "G+16 Residential",
      floorPlate: "5,500 sq. ft.",
      additional: "Premium residential tower",
      description:
        "G+16 high-rise residential milestone in prime Khare Town. Engineered with advanced seismic resilience, monolithic shear walls, and tailored structural layouts for spacious luxury apartments.",
      image: "/images/royale-regency.jpg",
      progressImages: [
        "/images/royale-progress-01.jpg",
        "/images/royale-progress-02.jpg",
      ],
    },
    {
      id: "anjani-exotica",
      name: "Anjani Exotica",
      categoryName: "High-Rise Residential",
      location: "MIHAN, Nagpur",
      client: "Anjanikripa Projects Pvt. Ltd.",
      configuration: "F Wing · G+16",
      floorPlate: "5,500 sq. ft.",
      additional: "Podium slab · 10,000 sq. ft.",
      description:
        "Major residential high-rise within MIHAN development corridor. Comprises G+16 tower construction integrated with a massive 10,000 sq. ft. transfer podium slab supporting landscaped amenity zones.",
      image: "/images/anjani-exoctica.jpg",
      progressImages: [
        "/images/anjani-progress-01.jpg",
        "/images/anjani-progress-02.jpg",
        "/images/anjani-progress-03.jpg",
      ],
    },
    {
      id: "lotus-residency",
      name: "Lotus Residency",
      categoryName: "High-Rise Residential",
      location: "Laxmi Nagar, Nagpur",
      client: "Vrindavan Constructions, Nagpur",
      configuration: "G+11 Residential",
      floorPlate: "3,500 sq. ft.",
      additional: "Pit parking · 5,000 sq. ft.",
      description:
        "Exclusive G+11 multi-storey residential tower in Laxmi Nagar with automated 5,000 sq. ft. pit parking systems. Engineered for quiet residential luxury and structural longevity.",
      image: "/images/lotus-residency.jpg",
      progressImages: [
        "/images/lotus-progress-01.jpg",
        "/images/lotus-progress-02.jpg",
      ],
    },
    {
      id: "vrindavan-estate",
      name: "Vrindavan Estate",
      categoryName: "Residential Township & Towers",
      location: "Besa, Nagpur",
      client: "BVN Constro Ventures LLP",
      configuration: "Residential Township",
      floorPlate: "50,000 sq. ft. township area",
      additional: "Residential towers & community development",
      description:
        "Expansive 50,000 sq. ft. master-planned residential township in Besa featuring high-rise towers, civil roads, drainage, water supply systems, and community infrastructure.",
      image: "/images/vrindavan-estate.jpg",
      progressImages: [
        "/images/vrindavan-construction-01.jpg",
        "/images/vrindavan-construction-02.jpg",
      ],
    },
  ],
};

export const clientPartners = [
  { name: "Anjanikripa Projects", logo: "/images/client1.png" },
  { name: "Goleccha Housing Infra", logo: "/images/client2.png" },
  { name: "Raghav Lifespace", logo: "/images/client3.png" },
  { name: "Vrindavan Constructions", logo: "/images/client4.png" },
  { name: "Navratna Raghav", logo: "/images/client6.png" },
  { name: "BVN Constro Ventures", logo: "/images/client7.png" },
  { name: "Sadiq and Company", logo: "/images/client8.png" },
  { name: "Vijaywargi Infra", logo: "/images/client9.png" },
  { name: "Gopal Bricks", logo: "/images/client10.png" },
];
