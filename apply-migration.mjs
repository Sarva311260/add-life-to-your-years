import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const conn = await createConnection(url);

const statements = [
  `CREATE TABLE IF NOT EXISTS \`pemf_affiliates\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`name\` varchar(255) NOT NULL,
    \`email\` varchar(320) NOT NULL,
    \`phone\` varchar(50) NOT NULL,
    \`slug\` varchar(255) NOT NULL,
    \`isActive\` int NOT NULL DEFAULT 1,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`pemf_affiliates_id\` PRIMARY KEY(\`id\`),
    CONSTRAINT \`pemf_affiliates_slug_unique\` UNIQUE(\`slug\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`pemf_enquiries\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`affiliateId\` int NOT NULL,
    \`visitorName\` varchar(255) NOT NULL,
    \`visitorEmail\` varchar(320) NOT NULL,
    \`visitorPhone\` varchar(50),
    \`message\` text,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`pemf_enquiries_id\` PRIMARY KEY(\`id\`)
  )`
];

for (const sql of statements) {
  try {
    await conn.execute(sql);
    console.log('✓ Executed successfully');
  } catch (err) {
    console.error('✗ Error:', err.message);
  }
}

await conn.end();
console.log('Done');
