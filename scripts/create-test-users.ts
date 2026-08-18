import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function createUsers() {
  try {
    console.log("Creating Admin User...");
    const adminRes = await auth.api.signUpEmail({
      body: {
        email: "admin@example.com",
        password: "password123",
        name: "Admin User",
      },
    });
    if (adminRes.user) {
      await db.update(users).set({ role: "admin", emailVerified: true }).where(eq(users.id, adminRes.user.id));
      console.log("Admin User created successfully: admin@example.com / password123");
    } else {
      console.log("Failed to create Admin User", adminRes);
    }

    console.log("Creating Instructor User...");
    const instRes = await auth.api.signUpEmail({
      body: {
        email: "instructor@example.com",
        password: "password123",
        name: "Instructor User",
      },
    });
    if (instRes.user) {
      await db.update(users).set({ role: "instructor", emailVerified: true }).where(eq(users.id, instRes.user.id));
      console.log("Instructor User created successfully: instructor@example.com / password123");
    } else {
      console.log("Failed to create Instructor User", instRes);
    }
  } catch (error) {
    console.error("Error creating users:", error);
  }
  process.exit(0);
}

createUsers();
