import { Pool } from "pg";

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'PatientX',
//     password: 'dharun@2005',
//     port: 5432,
// });

const pool = new Pool({connectionString: "postgresql://neondb_owner:npg_flm7ehY4bcIa@ep-shiny-sound-adlk2znm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"});

export default pool;