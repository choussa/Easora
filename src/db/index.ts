import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

// Connection string for PostgreSQL
// We use an environment variable so it works in local dev (e.g. Docker)
// and in Azure App Service / Static Web Apps
const connectionString = import.meta.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/easora';

// Disable prefetch as it is not supported for "Transaction" pool mode (often used in serverless)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
