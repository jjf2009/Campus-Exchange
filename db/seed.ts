import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { listings, users } from "./schema";
import { getCategoryImage } from "../lib/constants";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database");
  }

  const client = postgres(connectionString, { prepare: false, max: 1 });
  const db = drizzle(client);

  console.log("Seeding database...");

  const demoUsers = await db
    .insert(users)
    .values([
      {
        email: "rahul.demo@gec.ac.in",
        name: "Rahul Sharma",
        branch: "Mechanical",
        year: "Final Year",
        phone: "9876543210",
        avatarUrl: null,
      },
      {
        email: "priya.demo@gec.ac.in",
        name: "Priya Naik",
        branch: "Computer",
        year: "Third Year",
        phone: "9876543211",
        avatarUrl: null,
      },
      {
        email: "arjun.demo@gec.ac.in",
        name: "Arjun Desai",
        branch: "Electrical",
        year: "Second Year",
        phone: "9876543212",
        avatarUrl: null,
      },
    ])
    .onConflictDoNothing()
    .returning();

  // If conflict, fetch existing demo users
  let sellers = demoUsers;
  if (sellers.length === 0) {
    const { eq, or } = await import("drizzle-orm");
    sellers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, "rahul.demo@gec.ac.in"),
          eq(users.email, "priya.demo@gec.ac.in"),
          eq(users.email, "arjun.demo@gec.ac.in")
        )
      );
  }

  if (sellers.length < 2) {
    console.log("Could not resolve demo users. Aborting seed of listings.");
    await client.end();
    return;
  }

  const [rahul, priya, arjun] = sellers;

  await db.insert(listings).values([
    {
      sellerId: rahul.id,
      title: "Engineering Drawing Boiler",
      description:
        "Barely used boiler from first year engineering drawing. No dents, includes case.",
      price: 850,
      category: "Boiler",
      condition: "Good",
      imageUrl: getCategoryImage("Boiler"),
      status: "AVAILABLE",
    },
    {
      sellerId: rahul.id,
      title: "Mini Drafter with Box",
      description:
        "Complete mini drafter set. Scales are clean and screws work fine.",
      price: 450,
      category: "Drafter",
      condition: "Like New",
      imageUrl: getCategoryImage("Drafter"),
      status: "AVAILABLE",
    },
    {
      sellerId: priya.id,
      title: "Scientific Calculator Casio fx-991ES",
      description:
        "Working Casio scientific calculator. Battery included. Perfect for exams.",
      price: 600,
      category: "Calculator",
      condition: "Good",
      imageUrl: getCategoryImage("Calculator"),
      status: "AVAILABLE",
    },
    {
      sellerId: priya.id,
      title: "Bomber Jacket - Medium",
      description:
        "Warm bomber jacket, lightly used. Great for hostel winters.",
      price: 700,
      category: "Bomber",
      condition: "Good",
      imageUrl: getCategoryImage("Bomber"),
      status: "AVAILABLE",
    },
    {
      sellerId: arjun?.id ?? priya.id,
      title: "Hostel Mattress",
      description:
        "Clean single mattress. Moving out of hostel, must sell this week.",
      price: 400,
      category: "Mattress",
      condition: "Good",
      imageUrl: getCategoryImage("Mattress"),
      status: "AVAILABLE",
    },
    {
      sellerId: arjun?.id ?? rahul.id,
      title: "Table Fan",
      description: "Quiet table fan, works perfectly. Cord is intact.",
      price: 300,
      category: "Fan",
      condition: "Like New",
      imageUrl: getCategoryImage("Fan"),
      status: "AVAILABLE",
    },
  ]);

  console.log("Seed complete: demo users and listings inserted.");
  await client.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
