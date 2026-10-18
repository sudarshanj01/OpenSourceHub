import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Digital QR Menu Board database...');

  // 1. Ensure Restaurant Profile
  const existingProfile = await prisma.restaurantProfile.findFirst();
  if (!existingProfile) {
    await prisma.restaurantProfile.create({
      data: {
        name: "The Rustic Skillet Bistro",
        tagline: "Artisanal Comfort Food & Craft Sips",
        description: "Locally sourced ingredients, hand-crafted wood-fired recipes, and refreshing beverages made fresh every day.",
        currencySymbol: "$",
        currencyCode: "USD",
        taxPercentage: 8.5,
        serviceChargePercentage: 0.0,
        address: "124 Market Square, Culinary District",
        phone: "+1 (555) 789-4321",
        email: "hello@rusticskillet.example",
        wifiSsid: "RusticSkillet_Guest",
        wifiPassword: "FreshFood2026",
        openingHours: "Tue - Sun: 11:00 AM – 10:00 PM (Closed Mon)",
        tableCount: 16,
        adminPin: "1234",
        themeColor: "amber",
        bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      },
    });
    console.log('✅ Created default Restaurant Profile');
  }

  // 2. Check if Categories already exist
  const count = await prisma.category.count();
  if (count === 0) {
    // Category 1: Starters & Small Plates
    const starters = await prisma.category.create({
      data: {
        name: "Starters & Small Plates",
        description: "Perfect for sharing or kicking off your culinary journey",
        icon: "Utensils",
        sortOrder: 1,
        items: {
          create: [
            {
              name: "Crispy Truffle Parmesan Fries",
              description: "Hand-cut Idaho russets tossed in white truffle oil, grated pecorino, fresh rosemary, served with garlic aioli.",
              price: 9.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: true,
              calories: 420,
              prepTimeMinutes: 10,
              badge: "Bestseller",
              sortOrder: 1,
            },
            {
              name: "Fire-Roasted Garlic Bruschetta",
              description: "Charred sourdough topped with heirloom tomatoes, sweet basil, cold-pressed olive oil, and aged balsamic glaze.",
              price: 8.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: false,
              calories: 280,
              prepTimeMinutes: 8,
              badge: "Fresh Pick",
              sortOrder: 2,
            },
            {
              name: "Smoked Paprika Calamari",
              description: "Flash-fried tender squid dusted in Spanish paprika and sea salt, accompanied by charred lemon and smoked chili remoulade.",
              price: 13.00,
              isAvailable: true,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: true,
              isChefSpecial: false,
              calories: 390,
              prepTimeMinutes: 12,
              sortOrder: 3,
            },
            {
              name: "Whipped Ricotta & Wild Honey Dip",
              description: "Creamy sheep's milk ricotta, hot blossom honey, toasted pistachios, served with warm za'atar flatbread.",
              price: 11.00,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: false,
              calories: 340,
              prepTimeMinutes: 8,
              sortOrder: 4,
            },
          ],
        },
      },
    });

    // Category 2: Wood-Fired Pizzas
    const pizzas = await prisma.category.create({
      data: {
        name: "Wood-Fired Pizzas",
        description: "Slow-fermented sourdough crust charred at 800°F",
        icon: "Flame",
        sortOrder: 2,
        items: {
          create: [
            {
              name: "Classic Margherita D.O.P.",
              description: "San Marzano tomato coulis, buffalo mozzarella, fresh basil, extra virgin olive oil.",
              price: 15.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: false,
              calories: 780,
              prepTimeMinutes: 15,
              badge: "Classic",
              sortOrder: 1,
            },
            {
              name: "Hot Honey & Spicy Soppressata",
              description: "Artisan spicy salami, crushed red pepper, smoked provolone, finished with habanero-infused wildflower honey.",
              price: 18.50,
              isAvailable: true,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: true,
              isChefSpecial: true,
              calories: 920,
              prepTimeMinutes: 15,
              badge: "House Favorite",
              sortOrder: 2,
            },
            {
              name: "Forest Mushroom & Truffle Cream",
              description: "Roasted cremini and shiitake mushrooms, thyme garlic cream, taleggio cheese, and white truffle essence.",
              price: 19.00,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: false,
              calories: 840,
              prepTimeMinutes: 16,
              sortOrder: 3,
            },
            {
              name: "Mediterranean Garden (Vegan)",
              description: "Kalamata olives, grilled artichoke hearts, sundried tomatoes, vegan mozzarella, and wild arugula.",
              price: 16.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: false,
              calories: 680,
              prepTimeMinutes: 14,
              sortOrder: 4,
            },
          ],
        },
      },
    });

    // Category 3: Mains & Skillet Specialties
    const mains = await prisma.category.create({
      data: {
        name: "Mains & Skillet Specialties",
        description: "Hearty, slow-cooked signature dishes served piping hot",
        icon: "ChefHat",
        sortOrder: 3,
        items: {
          create: [
            {
              name: "The Rustic Smash Double Burger",
              description: "Two prime Angus patties smashed crispy with sharp cheddar, caramelized onions, house pickles, and secret sauce on brioche.",
              price: 16.00,
              isAvailable: true,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: true,
              calories: 890,
              prepTimeMinutes: 14,
              badge: "Bestseller",
              sortOrder: 1,
            },
            {
              name: "Cast-Iron Skillet Roasted Salmon",
              description: "Atlantic salmon fillet seared in cast iron with lemon-herb butter, accompanied by roasted asparagus and creamy polenta.",
              price: 24.00,
              isAvailable: true,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: false,
              calories: 650,
              prepTimeMinutes: 18,
              sortOrder: 2,
            },
            {
              name: "Slow-Braised Short Rib Ragù",
              description: "Tender beef short rib braised for 8 hours in Chianti, tossed with fresh pappardelle pasta and shaved parmesan.",
              price: 22.50,
              isAvailable: true,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: true,
              calories: 820,
              prepTimeMinutes: 15,
              badge: "Chef's Pick",
              sortOrder: 3,
            },
            {
              name: "Smoked Chipotle Black Bean Burger",
              description: "House-made quinoa and black bean patty, avocado mash, chipotle vegan mayo, cilantro lime slaw on a multigrain bun.",
              price: 15.00,
              isAvailable: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: false,
              isSpicy: true,
              isChefSpecial: false,
              calories: 590,
              prepTimeMinutes: 12,
              sortOrder: 4,
            },
          ],
        },
      },
    });

    // Category 4: Fresh Greens & Bowls
    const bowls = await prisma.category.create({
      data: {
        name: "Fresh Greens & Bowls",
        description: "Vibrant, nourishing, and guilt-free creations",
        icon: "Salad",
        sortOrder: 4,
        items: {
          create: [
            {
              name: "Avocado Quinoa Green Goddess Bowl",
              description: "Warm tri-color quinoa, baby kale, Hass avocado, edamame, cucumber ribbons, sunflower seeds, green goddess tahini dressing.",
              price: 14.00,
              isAvailable: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: false,
              calories: 460,
              prepTimeMinutes: 10,
              sortOrder: 1,
            },
            {
              name: "Grilled Peach & Burrata Salad",
              description: "Caramelized farm peaches, whole Italian burrata ball, prosciutto di Parma, candied pecans, micro arugula with aged Modena balsamic.",
              price: 15.50,
              isAvailable: true,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: true,
              calories: 520,
              prepTimeMinutes: 10,
              badge: "Seasonal",
              sortOrder: 2,
            },
          ],
        },
      },
    });

    // Category 5: Handcrafted Sips & Drinks
    const drinks = await prisma.category.create({
      data: {
        name: "Handcrafted Sips & Drinks",
        description: "Signature cold brews, mocktails, and freshly pressed blends",
        icon: "Coffee",
        sortOrder: 5,
        items: {
          create: [
            {
              name: "Rosemary Grapefruit Sparkler (Mocktail)",
              description: "Freshly squeezed ruby red grapefruit juice, rosemary simple syrup, sparkling mineral water, charred rosemary sprig.",
              price: 6.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: false,
              calories: 110,
              prepTimeMinutes: 5,
              badge: "Refreshing",
              sortOrder: 1,
            },
            {
              name: "Nitro Cold Brew with Vanilla Cream",
              description: "Single-origin Ethiopian cold brew infused with nitrogen for a velvety head, topped with Madagascar sweet cream.",
              price: 5.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: false,
              calories: 140,
              prepTimeMinutes: 3,
              sortOrder: 2,
            },
            {
              name: "Smoked Hibiscus Margarita (Craft)",
              description: "Artisanal mezcal, wild hibiscus reduction, fresh lime, orange liqueur, smoked black volcanic salt rim.",
              price: 12.00,
              isAvailable: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: true,
              calories: 190,
              prepTimeMinutes: 5,
              sortOrder: 3,
            },
          ],
        },
      },
    });

    // Category 6: Sweet Endings
    const desserts = await prisma.category.create({
      data: {
        name: "Sweet Endings",
        description: "Baked fresh daily in-house by our pastry chef",
        icon: "Cake",
        sortOrder: 6,
        items: {
          create: [
            {
              name: "Warm Skillet Dark Chocolate Cookie",
              description: "Baked-to-order Valrhona chocolate chip cookie in mini cast-iron skillet, topped with Madagascar vanilla bean gelato and sea salt.",
              price: 9.00,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              isSpicy: false,
              isChefSpecial: true,
              calories: 620,
              prepTimeMinutes: 12,
              badge: "Must Try",
              sortOrder: 1,
            },
            {
              name: "Wild Berry Lemon Panna Cotta",
              description: "Silky Meyer lemon panna cotta topped with raspberry-blackberry compote and fresh mint leaves.",
              price: 8.50,
              isAvailable: true,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              isSpicy: false,
              isChefSpecial: false,
              calories: 380,
              prepTimeMinutes: 5,
              sortOrder: 2,
            },
          ],
        },
      },
    });

    console.log('✅ Seeded 6 categories and 20 handcrafted menu items!');
  } else {
    console.log(`ℹ️ Categories already exist (${count} found). Skipping item seed.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
