import * as dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const dbHost = process.env.DB_HOST;

console.log(`Server running on port ${port}, connecting to ${dbHost}`);