import { upload } from 'pg-upload';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);


console.log('Recreating tables...');
await db.query(`
    drop table if exists land, tid, handelstype, varegruppe, måling;
`); 

console.log('Tables recreated.');

console.log('Data inserted.')
await db.query(`
    create table land (
    land_id      integer,
    land_navn    text
    )
`);

console.log('Data inserted.')
await db.query(`
    create table tid (
    tid_id      integer,
    år          integer,
    kvatal      integer
    )
`);

console.log('Data inserted.')
await db.query(`
    create table handelstype (
    handelstype_id      integer,
    tid_id       integer,
    land_id      integer,
    varegruppe   integer,
    handelstype  text,
    værdi        decimal,
    måling_id    integer
    )
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
    'db/danmark handle 2018-2025.csv',
    'copy (album_id, title, artist_id, release_date, riaa_certificate) from stdin with csv header'
  );
