import { defineConfig } from 'drizzle-kit';

// Read the database URL from environment
const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/easora';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
