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

const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);


  console.log('recreating tables...');
  await db.query(`
    drop table if exists handel;
    CREATE TABLE handel (
      id INTEGER,
      tid TEXT,
      eksport NUMERIC,
      import NUMERIC,
      netto NUMERIC
    );
  `);

  await db.query(`
    drop table if exists samlede;
    CREATE TABLE samlede (
      id INTEGER,
      land TEXT,
      tid INTEGER,
      import NUMERIC,
      eksport NUMERIC
    );
  `);

  await db.query(`
    drop table if exists eksport;
    CREATE TABLE eksport (
      eksport_id INTEGER,
      land TEXT,
      tid   INTEGER,
      indhold NUMERIC,
      sitc TEXT
    );
  `);

  await db.query(`
    drop table if exists import;
    CREATE TABLE import (
      import_id INTEGER,
      land TEXT,
      tid   INTEGER,
      indhold NUMERIC,
      sitc TEXT
    );
  `);

  console.log('Tables recreated.');
  
  await upload(
    db,
    'DB/LineChart.csv',
    'copy handel (id, tid, eksport, import, netto) from stdin with csv header'
  );

  await upload(
    db,
    'DB/BarChart.csv',
    'copy samlede (id, tid, land, import, eksport) from stdin with csv header'
  );

  await upload(
    db,
    'DB/Varegrupper - Eksport.csv',
    'copy eksport (eksport_id, land, tid, indhold, sitc) from stdin with csv header'
  );

  await upload(
    db,
    'DB/Varegrupper - Import.csv',
    'copy import (import_id, land, tid, sitc, indhold) from stdin with csv header'
  );

  await db.end();
console.log('All data inserted.');

