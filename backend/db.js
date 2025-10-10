import { Pool } from "pg";

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'PatientX',
    password: 'dharun@2005',
    port: 5432,
});

export default pool;