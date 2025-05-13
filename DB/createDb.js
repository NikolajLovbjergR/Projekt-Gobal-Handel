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

console.log('Data inserted.')
await db.query(`
    create table varegruppe (
    varegruppe_id   integer,
    sitc_kode       text
    )
`);

console.log('Data inserted.')
await db.query(`
    create table måling (
    måling_id     integer,
    navn          text,
    enhed         text
    )
`);


  await upload(
    db,
    'DB/danmark handle 2018-2025.csv',
    'copy (kvatal, eksport, import, netto) from stdin with csv header'
  );

  await upload(
    db,
    'DB/Varegrupper - Eksport.csv',
    'copy (eksport_id, land, indhold, sitc) from stdin with csv header'
  );

  await upload(
    db,
    'DB/Varegrupper - Import.csv',
    'copy (import_id, land, indhold, sitc) from stdin with csv header'
  );


};