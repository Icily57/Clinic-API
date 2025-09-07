import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env" });

const client = neon(process.env.DATABASE_URL as string);
export const db = drizzle(client, { schema, logger: true }); // create a drizzle instance

export default db;