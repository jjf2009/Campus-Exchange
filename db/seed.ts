import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { listings, users } from "./schema";

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
        phone: "+919876543210",
        avatarUrl: null,
      },
      {
        email: "priya.demo@gec.ac.in",
        name: "Priya Naik",
        branch: "Computer",
        year: "Third Year",
        phone: "+919876543211",
        avatarUrl: null,
      },
      {
        email: "arjun.demo@gec.ac.in",
        name: "Arjun Desai",
        branch: "Electrical",
        year: "Second Year",
        phone: "+919876543212",
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
      imageUrl: null,
      status: "AVAILABLE",
    },
    {
      sellerId: rahul.id,
      title: "Mini Drafter with Box",
      description:
        "Complete mini drafter set. Scales are clean and screws work fine.",
      price: 450,
      category: "Mini Drafter",
      condition: "Like New",
      imageUrl: null,
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
      imageUrl: null,
      status: "AVAILABLE",
    },
    {
      sellerId: priya.id,
      title: "Strength of Materials Textbook",
      description:
        "R S Khurmi SOM textbook. Highlighted notes for GEC syllabus included.",
      price: 250,
      category: "Books",
      condition: "Fair",
      imageUrl: null,
      status: "AVAILABLE",
    },
    {
      sellerId: arjun?.id ?? priya.id,
      title: "Hostel Study Chair",
      description:
        "Comfortable plastic study chair. Moving out of hostel, must sell this week.",
      price: 400,
      category: "Chair",
      condition: "Good",
      imageUrl: null,
      status: "AVAILABLE",
    },
    {
      sellerId: arjun?.id ?? rahul.id,
      title: "Drawing Kit Complete Set",
      description:
        "Compass, divider, set squares, protractor — full engineering drawing kit.",
      price: 300,
      category: "Drawing Kit",
      condition: "Like New",
      imageUrl: null,
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
