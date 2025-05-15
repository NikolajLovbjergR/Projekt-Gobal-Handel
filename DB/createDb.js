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
    DROP TABLE IF EXISTS handel, samlede, eksport, import;
  `);

  console.log('Creating tables...');
  await db.query(`
    CREATE TABLE handel (
      LineChart_id INTEGER,
      tid INTEGER,
      eksport NUMERIC,
      import NUMERIC,
      netto NUMERIC
    );
  `);

  await db.query(`
    CREATE TABLE samlede (
      id INTEGER,
      tid INTEGER,
      land TEXT,
      import NUMERIC,
      eksport NUMERIC
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
      indhold NUMERIC,
      sitc TEXT
    );
  `);

  await upload(
    db,
    'DB/LineChart.csv',
    'copy handel (LineChart_id, tid, eksport, import, netto) from stdin with csv header'
  );

  await upload(
    db,
    'DB/BarChart.csv',
    'copy samlede (id, tid, land, import, eksport) from stdin with csv header'
  );

  await upload(
    db,
    'DB/Varegrupper - Eksport.csv',
    'copy eksport (eksport_id, land, indhold, sitc) from stdin with csv header'
  );

  await upload(
    db,
    'DB/Varegrupper - Import.csv',
    'copy import (import_id, land, indhold, sitc) from stdin with csv header'
  );

};