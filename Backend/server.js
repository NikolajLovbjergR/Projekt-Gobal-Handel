import express from 'express';
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
const dbResult = await db.query('select now() as now');
console.log('Database connection established on', dbResult.rows[0].now);


console.log('Initialising webserver...');
const port = 3001;
const server = express();
server.use(express.static('Frontend'));

server.listen(port, onServerReady);

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

server.get('/api/handel', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COALESCE(imp.land, exp.land) AS land,
        COALESCE(imp.tid, exp.tid) AS tid,
        SUM(imp.indhold) AS total_import,
        SUM(exp.indhold) AS total_eksport
      FROM
        import imp
      FULL OUTER JOIN eksport exp ON imp.land = exp.land AND imp.tid = exp.tid
      GROUP BY COALESCE(imp.land, exp.land), COALESCE(imp.tid, exp.tid)
      ORDER BY land, tid;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fejl ved hentning af data fra import/eksport:', err);
    res.status(500).send('Databasefejl');
  }
});

server.get('/api/samlede', async (req, res) => {

  try {
    const result = await db.query(`
      SELECT tid, land, import, eksport FROM samlede
      ORDER BY tid, land
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fejl ved hentning af bar chart data:', err);
    res.status(500).send('Databasefejl');
  }
});


server.get('/api/linechart', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tid AS "Tid", eksport AS "Eksport", import AS "Import", netto AS "Netto"
      FROM handel
      ORDER BY tid;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fejl ved hentning af linechart-data:', err);
    res.status(500).send('Databasefejl');
  }
});

server.get('/api/treemap', async (req, res) => {
  try {
    const result = await db.query(`
       SELECT tid AS year, land, sitc AS produkt, 'Eksport' AS type, SUM(indhold) AS værdi
      FROM eksport
      GROUP BY tid, land, sitc
      UNION ALL
      SELECT tid AS year, land, sitc AS produkt, 'Import', SUM(indhold)
      FROM import
      GROUP BY tid, land, sitc
      
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fejl ved hentning af treemap-data:', err);
    res.status(500).send('Databasefejl');
  }
});
