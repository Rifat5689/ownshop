import "dotenv/config";
import mongoose from "mongoose";
import Store from "../src/modules/store/store.model.js";
import Category from "../src/modules/category/category.model.js";
import Product from "../src/modules/product/product.model.js";
import User from "../src/modules/user/user.model.js";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

const categoryNames = [
  "Beauty",
  "Skincare",
  "Makeup",
  "Fragrance",
  "Tools",
  "Bodycare",
];
const adjectives = [
  "Radiant",
  "Velvet",
  "Dewy",
  "Pure",
  "Luminous",
  "Botanical",
  "Silken",
  "Rose",
  "Golden",
  "Fresh",
];
const productsByCategory = {
  Beauty: ["Glow Balm", "Beauty Elixir", "Face Mist", "Hydrating Primer"],
  Skincare: [
    "Vitamin C Serum",
    "Gentle Cleanser",
    "Daily Moisturizer",
    "Night Repair Cream",
  ],
  Makeup: [
    "Matte Lip Color",
    "Blush Palette",
    "Lengthening Mascara",
    "Skin Tint",
  ],
  Fragrance: [
    "Floral Eau de Parfum",
    "Amber Body Mist",
    "Vanilla Perfume Oil",
    "Rose Musk",
  ],
  Tools: [
    "Makeup Brush Set",
    "Facial Roller",
    "Blending Sponge",
    "Lash Curler",
  ],
  Bodycare: [
    "Nourishing Body Lotion",
    "Sugar Body Scrub",
    "Hand Cream",
    "Shower Gel",
  ],
};
const imageIds = [
  "photo-1596462502278-27bfdc403348",
  "photo-1612817288484-6f916006741a",
  "photo-1571781926291-c477ebfd024b",
  "photo-1522335789203-aabd1fc54bc9",
  "photo-1608248543803-ba4f8c70ae0b",
  "photo-1620916566398-39f1143ab7be",
  "photo-1598440947619-2c35fc9aa908",
  "photo-1580870069867-74c57ee1bb07",
  "photo-1611930022073-b7a4ba5fcccd",
  "photo-1591375462077-800a22f5fba4",
];
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

await mongoose.connect(process.env.MONGODB_URI, {
  autoIndex: false,
  serverSelectionTimeoutMS: 15000,
});
try {
  const store = await Store.findOneAndUpdate(
    { slug: "originsofbeauty" },
    {
      $set: {
        name: "Origins of Beauty",
        description:
          "Authentic beauty, skincare and self-care essentials, curated for your everyday ritual.",
        plan: "Premium",
        subscriptionStatus: "ACTIVE",
        status: "ACTIVE",
        shippingFee: 70,
        supportEmail: "support@originsofbeauty.com",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const categories = {};
  for (const name of categoryNames) {
    const slug = slugify(name);
    categories[name] = await Category.findOneAndUpdate(
      { tenantId: store._id, slug },
      { $set: { name } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  for (let index = 0; index < 100; index += 1) {
    const categoryName = categoryNames[index % categoryNames.length];
    const baseName =
      productsByCategory[categoryName][
        index % productsByCategory[categoryName].length
      ];
    const name = `${adjectives[index % adjectives.length]} ${baseName} ${String(index + 1).padStart(3, "0")}`;
    const slug = `originsofbeauty-${slugify(name)}`;
    const price = 350 + ((index * 137) % 2650);
    const discount = index % 4 === 0 ? 15 : index % 7 === 0 ? 10 : 0;
    const imageId = imageIds[index % imageIds.length];
    await Product.findOneAndUpdate(
      { slug },
      {
        $set: {
          tenantId: store._id,
          name,
          title: name,
          subtitle: `${categoryName} essential`,
          description: `A carefully selected ${categoryName.toLowerCase()} essential for a simple, beautiful everyday routine. Authentic, easy to use, and suitable for gifting.`,
          shortDescription: `Curated ${categoryName.toLowerCase()} essential from Origins of Beauty.`,
          price,
          category: categories[categoryName]._id,
          images: [
            {
              url: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=80`,
              public_id: `originsofbeauty-demo-${index + 1}`,
            },
          ],
          stock: 10 + ((index * 11) % 75),
          discount,
          isActive: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  let admin = await User.findOne({ username: "origins" });
  if (!admin)
    admin = new User({
      username: "origins",
      email: "origins@originsofbeauty.com",
    });
  admin.email = "origins@originsofbeauty.com";
  admin.password = "123456";
  admin.role = "ADMIN";
  admin.tenantId = store._id;
  admin.isActive = true;
  admin.refreshToken = null;
  await admin.save();

  console.log(
    "Origins of Beauty seeded: 1 store, 6 categories, 100 products, and 1 merchant admin.",
  );
} finally {
  await mongoose.disconnect();
}
