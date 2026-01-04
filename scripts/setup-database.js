// File: scripts/setup-database.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database setup...");

  // --- 1. Create Default Admin User ---
  const adminEmail = "admin@example.com";
  const passwordRaw = "admin123"; // Default password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(passwordRaw, saltRounds);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {}, // If exists, do nothing
    create: {
      email: adminEmail,
      name: "Super Admin",
      passwordHash: passwordHash,
      role: "admin",
      active: true,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email}`);
  console.log(`🔑 Password: ${passwordRaw}`);

  // --- 2. Create Initial Categories ---
  const categories = [
    {
      name: "Technology",
      slug: "technology",
      description: "Latest gadgets and software news.",
    },
    {
      name: "Health",
      slug: "health",
      description: "Medical breakthroughs and wellness tips.",
    },
    {
      name: "Business",
      slug: "business",
      description: "Markets, finance, and economy.",
    },
    {
      name: "Entertainment",
      slug: "entertainment",
      description: "Movies, music, and celebrity news.",
    },
    {
      name: "Sports",
      slug: "sports",
      description: "Scores, teams, and athlete updates.",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        active: true,
        orderIndex: 0,
      },
    });
  }
  console.log(`✅ Created ${categories.length} initial categories.`);

  // --- 3. Create Sample Subcategory (AI under Technology) ---
  const techCategory = await prisma.category.findUnique({
    where: { slug: "technology" },
  });

  if (techCategory) {
    await prisma.subcategory.upsert({
      where: {
        categoryId_slug: {
          categoryId: techCategory.id,
          slug: "ai-machine-learning",
        },
      },
      update: {},
      create: {
        name: "AI & Machine Learning",
        slug: "ai-machine-learning",
        description: "Updates on Artificial Intelligence.",
        categoryId: techCategory.id,
        active: true,
      },
    });
    console.log("✅ Created sample subcategory: AI & Machine Learning");
  }

  console.log("🎉 Database setup completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during setup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
