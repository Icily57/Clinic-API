import "dotenv/config"; // this automatically loads .env variables
import { defineConfig } from "drizzle-kit";

console.log("Database_URL:", process.env.DATABASE_URL);

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string, // make sure .env has DATABASE_URL
  },
  verbose: true,
  strict: true,
});
