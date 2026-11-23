const Admin = require("../models/Admin");
const HomepageSettings = require("../models/HomepageSettings");
const Category = require("../models/Category");
const Project = require("../models/Project");

const defaultCategories = [
  {
    slug: "hospital",
    title: "Hospital",
    subtitle: "Healthcare & Institutional Infrastructure",
    description:
      "Specialised healthcare facilities engineered for advanced medical operations, heavy structural loads, and sterile environments.",
    coverImage: "/images/ram-swar-medspace.jpg",
    coverImagePublicId: null,
    badge: "Healthcare",
    displayOrder: 1,
    isActive: true,
  },
  {
    slug: "commercial",
    title: "Commercial",
    subtitle: "Corporate Hubs & Retail Complexes",
    description:
      "Grade-A commercial spaces, multi-level basements, and retail complexes designed for commercial longevity and high footfall.",
    coverImage: "/images/whc-one.jpg",
    coverImagePublicId: null,
    badge: "Commercial",
    displayOrder: 2,
    isActive: true,
  },
  {
    slug: "residential",
    title: "High-Rise Residential",
    subtitle: "Premium Towers & Gated Townships",
    description:
      "Multistorey luxury towers and master-planned residential communities built with precision engineering and structural excellence.",
    coverImage: "/images/palacio.jpg",
    coverImagePublicId: null,
    badge: "Residential",
    displayOrder: 3,
    isActive: true,
  },
];

const defaultProjects = [
  // HOSPITAL
  {
    slug: "ram-swar-medspace",
    name: "Ram Swar Medspace",
    categoryId: "hospital",
    categoryName: "Hospital Infrastructure",
    location: "Nagpur, Maharashtra",
    client: "Akshay Mehadia (Gopal Bricks)",
    configuration: "G+9 Hospital Building",
    floorPlate: "6,500 sq. ft.",
    additional: "Double basement · 8,000 sq. ft.",
    description:
      "Modern G+9 healthcare facility featuring double basements for critical services and parking. Engineered with high-strength structural specifications to support specialized diagnostic machinery and medical infrastructure.",
    image: "/images/ram-swar-medspace.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/ram-swar-progress-01.jpg",
      "/images/ram-swar-progress-02.jpg",
    ],
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "mayo-hospital",
    name: "Mayo Hospital Admin Building",
    categoryId: "hospital",
    categoryName: "Hospital Infrastructure",
    location: "Mount Road, Nagpur",
    client: "Sadiq and Company",
    configuration: "G+7 Hospital Administration Building",
    floorPlate: "44,000 sq. ft.",
    additional: "Large-format institutional facility",
    description:
      "Extensive 44,000 sq. ft. institutional administration facility for Mayo Hospital. Built with durable structural frames, open floor plates, and streamlined service integration for healthcare administrative management.",
    image: "/images/mayo-hospital.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/mayo-progress-01.jpg",
      "/images/mayo-progress-02.jpg",
    ],
    displayOrder: 2,
    isPublished: true,
  },

  // COMMERCIAL
  {
    slug: "whc-one",
    name: "WHC One",
    categoryId: "commercial",
    categoryName: "Commercial Complex",
    location: "Coffee House Square, Nagpur",
    client: "Goleccha Housing Infra Pvt. Ltd.",
    configuration: "G+8 Commercial",
    floorPlate: "6,500 sq. ft.",
    additional: "Double basement · 10,000 sq. ft.",
    description:
      "Landmark G+8 commercial tower at Coffee House Square with 10,000 sq. ft. double basements for multi-level parking. Built with expansive column spacing for flexible retail and corporate floor plans.",
    image: "/images/whc-one.jpg",
    imagePublicId: null,
    progressImages: ["/images/whc-one-progress.jpg"],
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "limbanna-towers",
    name: "Limbanna Towers",
    categoryId: "commercial",
    categoryName: "Commercial Complex",
    location: "Sadar, Nagpur",
    client: "Akshay Limbanna (Navratna Raghav)",
    configuration: "G+8 Commercial",
    floorPlate: "8,000 sq. ft.",
    additional: "Double basement · 11,000 sq. ft.",
    description:
      "High-density commercial development situated in Sadar, Nagpur. Features deep excavation with 11,000 sq. ft. double basement shoring and 8,000 sq. ft. floor plates designed for high-capacity corporate tenancies.",
    image: "/images/limbanna-towers.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/limbanna-progress-01.jpg",
      "/images/limbanna-progress-02.jpg",
      "/images/limbanna-progress-03.jpg",
    ],
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: "vijaywargi-complex",
    name: "Vijaywargi Complex",
    categoryId: "commercial",
    categoryName: "Commercial Complex",
    location: "Bharat Nagar, Nagpur",
    client: "Vijaywargi Infra Engineers Pvt. Ltd.",
    configuration: "G+5 Commercial Complex",
    floorPlate: "5,500 sq. ft.",
    additional: "Prime commercial retail & corporate offices",
    description:
      "Contemporary G+5 commercial establishment combining ground-level retail frontages with upper-level corporate suites. Engineered for high foot-traffic durability and efficient structural loading.",
    image: "/images/vijaywargi-complex.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/vijaywargi-progress-01.jpg",
      "/images/vijaywargi-progress-02.jpg",
      "/images/vijaywargi-progress-03.jpg",
    ],
    displayOrder: 3,
    isPublished: true,
  },

  // RESIDENTIAL
  {
    slug: "palacio",
    name: "Palacio",
    categoryId: "residential",
    categoryName: "High-Rise Residential",
    location: "Shankar Nagar, Nagpur",
    client: "Raghav Lifespace",
    configuration: "G+15 Residential",
    floorPlate: "6,500 sq. ft.",
    additional: "Luxury high-rise residential apartments",
    description:
      "Prestigious G+15 luxury residential tower in Shankar Nagar. Features modern architectural silhouettes, precision-cast reinforced concrete framework, and panoramic views of the Nagpur skyline.",
    image: "/images/palacio.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/palacio-progress-01.jpg",
      "/images/palacio-progress-02.jpg",
    ],
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "royale-regency",
    name: "Royale Regency",
    categoryId: "residential",
    categoryName: "High-Rise Residential",
    location: "Khare Town, Nagpur",
    client: "Vrindavan Constructions, Nagpur",
    configuration: "G+16 Residential",
    floorPlate: "5,500 sq. ft.",
    additional: "Premium residential tower",
    description:
      "G+16 high-rise residential milestone in prime Khare Town. Engineered with advanced seismic resilience, monolithic shear walls, and tailored structural layouts for spacious luxury apartments.",
    image: "/images/royale-regency.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/royale-progress-01.jpg",
      "/images/royale-progress-02.jpg",
    ],
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: "anjani-exotica",
    name: "Anjani Exotica",
    categoryId: "residential",
    categoryName: "High-Rise Residential",
    location: "MIHAN, Nagpur",
    client: "Anjanikripa Projects Pvt. Ltd.",
    configuration: "F Wing · G+16",
    floorPlate: "5,500 sq. ft.",
    additional: "Podium slab · 10,000 sq. ft.",
    description:
      "Major residential high-rise within MIHAN development corridor. Comprises G+16 tower construction integrated with a massive 10,000 sq. ft. transfer podium slab supporting landscaped amenity zones.",
    image: "/images/anjani-exoctica.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/anjani-progress-01.jpg",
      "/images/anjani-progress-02.jpg",
      "/images/anjani-progress-03.jpg",
    ],
    displayOrder: 3,
    isPublished: true,
  },
  {
    slug: "lotus-residency",
    name: "Lotus Residency",
    categoryId: "residential",
    categoryName: "High-Rise Residential",
    location: "Laxmi Nagar, Nagpur",
    client: "Vrindavan Constructions, Nagpur",
    configuration: "G+11 Residential",
    floorPlate: "3,500 sq. ft.",
    additional: "Pit parking · 5,000 sq. ft.",
    description:
      "Exclusive G+11 multi-storey residential tower in Laxmi Nagar with automated 5,000 sq. ft. pit parking systems. Engineered for quiet residential luxury and structural longevity.",
    image: "/images/lotus-residency.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/lotus-progress-01.jpg",
      "/images/lotus-progress-02.jpg",
    ],
    displayOrder: 4,
    isPublished: true,
  },
  {
    slug: "vrindavan-estate",
    name: "Vrindavan Estate",
    categoryId: "residential",
    categoryName: "Residential Township & Towers",
    location: "Besa, Nagpur",
    client: "BVN Constro Ventures LLP",
    configuration: "Residential Township",
    floorPlate: "50,000 sq. ft. township area",
    additional: "Residential towers & community development",
    description:
      "Expansive 50,000 sq. ft. master-planned residential township in Besa featuring high-rise towers, civil roads, drainage, water supply systems, and community infrastructure.",
    image: "/images/vrindavan-estate.jpg",
    imagePublicId: null,
    progressImages: [
      "/images/vrindavan-construction-01.jpg",
      "/images/vrindavan-construction-02.jpg",
    ],
    displayOrder: 5,
    isPublished: true,
  },
];

const seedDefaults = async () => {
  try {
    // 1. Seed default Admin if not exists
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@jsramconstruction.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "JSRam@2026" : null);
    const adminUsername = adminEmail.split("@")[0] || "admin";

    if (!adminPassword) {
      console.warn("[Seed Security Notice] ADMIN_PASSWORD environment variable is not defined. Admin account will not be seeded automatically in production without an explicit password.");
    } else {
      const existingAdmin = await Admin.findOne({
        $or: [{ username: adminUsername }, { email: adminEmail }],
      });

      if (!existingAdmin) {
        const admin = new Admin({
          username: adminUsername,
          email: adminEmail,
          password: adminPassword,
          role: "Administrator",
        });
        await admin.save();
        console.log(`[Seed] Initial admin account seeded: email="${adminEmail}", username="${adminUsername}"`);
      }
    }

    // 2. Seed Homepage Settings if not exists
    const existingSettings = await HomepageSettings.findOne();
    if (!existingSettings) {
      await HomepageSettings.create({
        heroImage: "/images/hero-construction.jpg",
        heroImagePublicId: null,
      });
      console.log("[Seed] Default homepage hero settings seeded.");
    }

    // 3. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany(defaultCategories);
      console.log(`[Seed] Seeded ${defaultCategories.length} default categories.`);
    }

    // 4. Seed Projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany(defaultProjects);
      console.log(`[Seed] Seeded ${defaultProjects.length} default projects.`);
    }
  } catch (error) {
    console.warn(`[Seed Warning] Failed to seed default records: ${error.message}`);
  }
};

module.exports = {
  seedDefaults,
  defaultCategories,
  defaultProjects,
};
