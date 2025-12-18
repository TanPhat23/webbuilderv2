import { PrismaClient } from "../src/generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Seed data
const categories = [
  { id: "business", name: "Business" },
  { id: "ecommerce", name: "E-commerce" },
  { id: "portfolio", name: "Portfolio" },
  { id: "restaurant", name: "Restaurant" },
  { id: "blog", name: "Blog" },
  { id: "saas", name: "SaaS" },
  { id: "contact", name: "Contact" },
  { id: "photography", name: "Photography" },
  { id: "agency", name: "Agency" },
  { id: "testimonials", name: "Testimonials" },
  { id: "real-estate", name: "Real Estate" },
  { id: "pricing", name: "Pricing" },
];

const tags = [
  "business",
  "modern",
  "landing",
  "ecommerce",
  "shopping",
  "products",
  "portfolio",
  "hero",
  "creative",
  "restaurant",
  "menu",
  "food",
  "blog",
  "content",
  "responsive",
  "saas",
  "dashboard",
  "ui-kit",
  "contact",
  "form",
  "validation",
  "photography",
  "gallery",
  "lightbox",
  "agency",
  "services",
  "professional",
  "testimonials",
  "carousel",
  "reviews",
  "real-estate",
  "listings",
  "property",
  "pricing",
  "comparison",
  "plans",
];

const marketplaceItems = [
  {
    title: "Modern Business Landing Page",
    description:
      "A sleek and professional landing page template perfect for startups and businesses looking to make a strong first impression.",
    preview:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    templateType: "page",
    featured: true,
    pageCount: 1,
    tags: ["business", "modern", "landing"],
    downloads: 1247,
    likes: 892,
    categories: ["business"],
  },
  {
    title: "E-commerce Product Showcase",
    description:
      "Complete e-commerce template with product grids, shopping cart, and checkout flow.",
    preview:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800",
    templateType: "full-site",
    featured: false,
    pageCount: 5,
    tags: ["ecommerce", "shopping", "products"],
    downloads: 2156,
    likes: 1432,
    categories: ["ecommerce"],
  },
  {
    title: "Portfolio Hero Section",
    description:
      "Eye-catching hero section component for creative portfolios and personal websites.",
    preview: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800",
    templateType: "section",
    featured: false,
    tags: ["portfolio", "hero", "creative"],
    downloads: 892,
    likes: 567,
    categories: ["portfolio"],
  },
  {
    title: "Restaurant Menu Block",
    description:
      "Beautiful menu display component with categories, prices, and descriptions.",
    preview:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    templateType: "block",
    featured: false,
    tags: ["restaurant", "menu", "food"],
    downloads: 445,
    likes: 234,
    categories: ["restaurant"],
  },
  {
    title: "Blog Homepage Template",
    description:
      "Full blog template with featured posts, categories, and responsive design.",
    preview:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
    templateType: "page",
    featured: true,
    pageCount: 1,
    tags: ["blog", "content", "responsive"],
    downloads: 1876,
    likes: 1234,
    categories: ["blog"],
  },
  {
    title: "SaaS Dashboard UI Kit",
    description:
      "Complete dashboard interface with charts, tables, and navigation components.",
    preview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    templateType: "full-site",
    featured: false,
    pageCount: 8,
    tags: ["saas", "dashboard", "ui-kit"],
    downloads: 3241,
    likes: 2156,
    categories: ["saas"],
  },
  {
    title: "Contact Form Section",
    description:
      "Professional contact form with validation and multiple input types.",
    preview:
      "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800",
    templateType: "section",
    featured: false,
    tags: ["contact", "form", "validation"],
    downloads: 678,
    likes: 345,
    categories: ["contact"],
  },
  {
    title: "Photography Gallery Block",
    description:
      "Responsive image gallery with lightbox and filtering capabilities.",
    preview:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
    templateType: "block",
    featured: false,
    tags: ["photography", "gallery", "lightbox"],
    downloads: 923,
    likes: 678,
    categories: ["photography"],
  },
  {
    title: "Agency Services Page",
    description:
      "Showcase your agency's services with this clean and professional template.",
    preview: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
    templateType: "page",
    featured: false,
    pageCount: 1,
    tags: ["agency", "services", "professional"],
    downloads: 1456,
    likes: 987,
    categories: ["agency"],
  },
  {
    title: "Testimonial Carousel",
    description:
      "Interactive testimonial slider with customer reviews and ratings.",
    preview: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
    templateType: "block",
    featured: false,
    tags: ["testimonials", "carousel", "reviews"],
    downloads: 567,
    likes: 432,
    categories: ["testimonials"],
  },
  {
    title: "Real Estate Listing Site",
    description:
      "Complete real estate website with property listings, search, and details pages.",
    preview: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    templateType: "full-site",
    featured: true,
    pageCount: 12,
    tags: ["real-estate", "listings", "property"],
    downloads: 2891,
    likes: 1876,
    categories: ["real-estate"],
  },
  {
    title: "Pricing Table Section",
    description:
      "Flexible pricing table component with multiple plans and feature comparisons.",
    preview: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    templateType: "section",
    featured: false,
    tags: ["pricing", "comparison", "plans"],
    downloads: 1123,
    likes: 789,
    categories: ["pricing"],
  },
];

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Get or create a test user
  let user = await prisma.user.findFirst({
    where: {
      Email: { contains: "@" },
    },
  });

  if (!user) {
    console.log("⚠️  No users found. Creating a test user...");
    user = await prisma.user.create({
      data: {
        Id: "seed-user-id",
        Email: "demo@marketplace.com",
        FirstName: "Demo",
        LastName: "User",
        ImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      },
    });
    console.log("✅ Test user created\n");
  } else {
    console.log(`✅ Using existing user: ${user.Email}\n`);
  }

  // Clear existing marketplace data
  console.log("🧹 Cleaning existing marketplace data...");
  await prisma.marketplaceItemTag.deleteMany({});
  await prisma.marketplaceItemCategory.deleteMany({});
  await prisma.marketplaceItem.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  console.log("✅ Existing data cleared\n");

  // Seed Categories
  console.log("📦 Seeding categories...");
  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: {
          Id: category.id,
          Name: category.name,
        },
      }),
    ),
  );
  console.log(`✅ Created ${createdCategories.length} categories\n`);

  // Seed Tags
  console.log("🏷️  Seeding tags...");
  const createdTags = await Promise.all(
    tags.map((tag) =>
      prisma.tag.create({
        data: {
          Name: tag,
        },
      }),
    ),
  );
  console.log(`✅ Created ${createdTags.length} tags\n`);

  // Create a map of tag names to IDs
  const tagMap = new Map(createdTags.map((tag) => [tag.Name, tag.Id]));

  // Seed Marketplace Items
  console.log("🛍️  Seeding marketplace items...");
  let itemCount = 0;

  for (const item of marketplaceItems) {
    const createdItem = await prisma.marketplaceItem.create({
      data: {
        Title: item.title,
        Description: item.description,
        Preview: item.preview,
        TemplateType: item.templateType,
        Featured: item.featured,
        PageCount: item.pageCount,
        Downloads: item.downloads,
        Likes: item.likes,
        AuthorId: user.Id,
        AuthorName: `${user.FirstName} ${user.LastName}`.trim() || "Anonymous",
        Verified: true,
      },
    });

    // Connect tags
    for (const tagName of item.tags) {
      const tagId = tagMap.get(tagName);
      if (tagId) {
        await prisma.marketplaceItemTag.create({
          data: {
            ItemId: createdItem.Id,
            TagId: tagId,
          },
        });
      }
    }

    // Connect categories
    for (const categoryId of item.categories) {
      await prisma.marketplaceItemCategory.create({
        data: {
          ItemId: createdItem.Id,
          CategoryId: categoryId,
        },
      });
    }

    itemCount++;
    console.log(`  ✓ Created: ${item.title}`);
  }

  console.log(`\n✅ Created ${itemCount} marketplace items`);
  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Categories: ${createdCategories.length}`);
  console.log(`   - Tags: ${createdTags.length}`);
  console.log(`   - Marketplace Items: ${itemCount}`);
  console.log(`   - User: ${user.Email}`);
}

main()
  .catch((e) => {
    console.error("\n❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
