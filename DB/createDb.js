import { upload } from 'pg-upload';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);

const db = new pg.Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function createTablesAndUploadData() {
  const dbResult = await db.query('select now()');
  console.log('Database connection established on', dbResult.rows[0].now);

  console.log('Dropping existing tables...');
  await db.query(`
    DROP TABLE IF EXISTS handle, samlede, eksport, import;
  `);

  console.log('Creating tables...');
  await db.query(`
    CREATE TABLE handle (
      kvatal TEXT,
      eksport NUMERIC,
      import NUMERIC,
      netto NUMERIC
    );
  `);

  await db.query(`
    CREATE TABLE samlede (
      land TEXT,
      tid INTEGER,
      import NUMERIC,
      export NUMERIC
    );
  `);

  await db.query(`
    CREATE TABLE eksport (
      eksport_id INTEGER,
      land TEXT,
      indhold NUMERIC,
      sitc TEXT
    );
  `);

  await db.query(`
    CREATE TABLE import (
      import_id INTEGER,
      land TEXT,
      sitc TEXT,
      indhold NUMERIC
    );
  `);

  console.log('Uploading CSV files...');

  await upload(
    db,
    'db/Danmark handle 2018-2025.csv',
    'COPY handle(kvatal, eksport, import, netto) FROM STDIN WITH CSV HEADER'
  );

  await upload(
    db,
    'db/Danmarks samlede import og eksport.csv',
    'COPY samlede(land, tid, import, export) FROM STDIN WITH CSV HEADER'
  );

  await upload(
    db,
    'db/Varegrupper - Eksport.csv',
    'COPY eksport(eksport_id, land, indhold, sitc) FROM STDIN WITH CSV HEADER'
  );

  await upload(
    db,
    'db/Varegrupper - Import.csv',
    'COPY import(import_id, land, sitc, indhold) FROM STDIN WITH CSV HEADER'
  );

  console.log('Alle CSV-data er nu indlæst.');
  await db.end();
}

createTablesAndUploadData().catch((err) => {
  console.error('Fejl under databaseopsætning:', err);
  process.exit(1);
});
